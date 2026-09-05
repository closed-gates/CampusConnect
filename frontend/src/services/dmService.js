import { Client as StompClient } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getDeterministicRoomId } from '../utils/dmUtils.js';
import { fileToDataURL, recordDirectMessage } from '../models/dmPersistenceModel.js';

/**
 * DirectMessagingService
 *
 * Real-time DM service using STOMP WebSocket for cross-device/cross-user delivery.
 *
 * Transport architecture (after fix):
 *   sendDirectMessage()
 *     → POST via STOMP to /app/dm.send
 *     → Backend persists to DB + broadcasts to /topic/dm.{roomId}
 *     → ALL connected clients subscribed to /topic/dm.{roomId} receive it live
 *
 * Additional layers:
 *   - localStorage  : local message cache so history survives page refresh
 *   - BroadcastChannel: instant multi-tab sync within the same browser (bonus)
 *
 * STOMP connection is shared (singleton) and lazily opened on first use.
 * Room subscriptions are managed per-conversation (subscribe on join, unsubscribe on leave).
 */

const API_BASE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL || '').replace(/\/+$/, '');
const WS_URL   = `${API_BASE}/ws`;

class DirectMessagingService {
  constructor() {
    this.listeners = new Set();

    // STOMP client — shared singleton across all DM rooms
    this._stomp          = null;
    this._stompConnected = false;
    this._connectPromise = null;

    // Active room subscriptions: roomId → STOMP subscription object
    this._roomSubs       = {};

    // BroadcastChannel for same-device multi-tab sync (bonus layer)
    this.broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
      ? new BroadcastChannel('campusconnect_dm_realtime')
      : null;

    if (this.broadcastChannel) {
      this.broadcastChannel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'MESSAGE_RECEIVED' && payload) {
          this._emit('MESSAGE_RECEIVED', payload);
        } else if (type === 'TYPING_STATUS_CHANGED' && payload) {
          this._emit('TYPING_STATUS_CHANGED', payload);
        }
      };
    }
  }

  /* ── Subscriber management ────────────────────────────────────── */

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  _emit(event, payload) {
    this.listeners.forEach((listener) => {
      try { listener({ event, payload }); }
      catch (err) { console.error('[dmService] Error in listener:', err); }
    });
  }

  /* ── STOMP connection ─────────────────────────────────────────── */

  /**
   * Lazily connects to the STOMP backend.
   * Returns a Promise that resolves when the connection is ready.
   * Subsequent calls return the same promise until connected.
   */
  _connect() {
    if (this._stompConnected) return Promise.resolve();
    if (this._connectPromise)  return this._connectPromise;

    this._connectPromise = new Promise((resolve) => {
      const client = new StompClient({
        webSocketFactory: () => new SockJS(WS_URL),
        reconnectDelay: 5000,

        onConnect: () => {
          this._stompConnected = true;
          this._connectPromise = null;
          console.debug('[dmService] STOMP connected');
          resolve();
          // Re-subscribe to all active rooms after reconnect
          Object.keys(this._roomSubs).forEach(roomId => {
            this._subscribeToRoom(roomId);
          });
        },

        onDisconnect: () => {
          this._stompConnected = false;
          console.debug('[dmService] STOMP disconnected');
        },

        onStompError: (frame) => {
          console.warn('[dmService] STOMP error', frame);
          this._stompConnected = false;
          this._connectPromise = null;
          resolve(); // resolve anyway so callers aren't blocked forever
        },

        onWebSocketError: () => {
          this._stompConnected = false;
          this._connectPromise = null;
          resolve();
        },
      });

      client.activate();
      this._stomp = client;
    });

    return this._connectPromise;
  }

  /* ── Room subscription management ────────────────────────────── */

  /**
   * Subscribes to real-time messages for a conversation room.
   * Also requests history from the backend for this room.
   *
   * Call this when the user opens a conversation.
   *
   * @param {string} roomId - deterministic room ID
   */
  async subscribeToRoom(roomId) {
    if (!roomId) return;
    await this._connect();
    if (!this._stompConnected) return;

    // Avoid double-subscribing
    if (this._roomSubs[roomId]) return;

    this._subscribeToRoom(roomId);

    // Request history from the backend
    this._stomp.publish({
      destination: '/app/dm.history',
      body: JSON.stringify({ roomId }),
    });
  }

  /** Internal: creates the STOMP topic subscription for a room. */
  _subscribeToRoom(roomId) {
    if (!this._stomp?.connected || this._roomSubs[roomId]) return;

    // Subscribe to live messages
    const liveSub = this._stomp.subscribe(
      `/topic/dm.${roomId}`,
      (frame) => {
        try {
          const msg = JSON.parse(frame.body);
          // Normalise createdAt to ISO string
          if (msg.createdAt && typeof msg.createdAt !== 'string') {
            msg.createdAt = new Date(msg.createdAt).toISOString();
          }
          const conversationId = msg.roomId || roomId;
          const senderUser = {
            id: msg.senderId, displayName: msg.senderName, role: msg.senderRole,
          };
          const recipientUser = {
            id: msg.recipientId, displayName: msg.recipientName, role: msg.recipientRole,
          };
          const payload = { message: msg, conversationId, senderUser, recipientUser };

          // Cache locally for offline/refresh
          recordDirectMessage(senderUser, recipientUser, msg);

          this._emit('MESSAGE_RECEIVED', payload);

          // Sync to other tabs
          this.broadcastChannel?.postMessage({ type: 'MESSAGE_RECEIVED', payload });
        } catch (e) {
          console.warn('[dmService] Failed to parse incoming DM', e);
        }
      }
    );

    // Subscribe to history topic (one-shot for initial load)
    const histSub = this._stomp.subscribe(
      `/topic/dm.${roomId}.history`,
      (frame) => {
        try {
          const history = JSON.parse(frame.body);
          if (Array.isArray(history) && history.length > 0) {
            this._emit('HISTORY_LOADED', { roomId, history });
          }
          // Unsubscribe after receiving history once
          histSub.unsubscribe();
        } catch (e) {
          console.warn('[dmService] Failed to parse DM history', e);
        }
      }
    );

    this._roomSubs[roomId] = liveSub;
  }

  /**
   * Unsubscribes from a conversation room.
   * Call this when the user closes or leaves a conversation.
   *
   * @param {string} roomId
   */
  unsubscribeFromRoom(roomId) {
    if (this._roomSubs[roomId]) {
      try { this._roomSubs[roomId].unsubscribe(); } catch (_) {}
      delete this._roomSubs[roomId];
    }
  }

  /* ── Send message ─────────────────────────────────────────────── */

  /**
   * Sends a direct message.
   *
   * Primary path: publishes to /app/dm.send via STOMP.
   * The backend persists the message to the DB and broadcasts it
   * to /topic/dm.{roomId} — reaching ALL connected clients.
   *
   * Fallback path: if STOMP is not connected, writes locally only
   * (BroadcastChannel + localStorage) so the UI stays responsive.
   */
  async sendDirectMessage({
    senderId,
    recipientId,
    content,
    attachments = [],
    conversationId,
    recipientPresence = 'ONLINE',
    senderUser   = null,
    recipientUser = null,
  }) {
    const roomId = conversationId || getDeterministicRoomId(senderId, recipientId);

    const processedAttachments = await Promise.all(
      attachments.map(async (att) => ({
        id:   `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: att.name,
        size: att.size,
        type: att.type,
        url:  att.url || (att.file ? await fileToDataURL(att.file) : ''),
      }))
    );

    const sUser = senderUser   || { id: senderId,    displayName: senderId,    role: 'STUDENT' };
    const rUser = recipientUser || { id: recipientId, displayName: recipientId, role: 'FACULTY' };

    // Build the message object — id will be replaced by backend-assigned id after broadcast
    const optimisticMsg = {
      id:            `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      roomId,
      conversationId: roomId,
      senderId,
      senderName:    sUser.displayName,
      senderRole:    sUser.role,
      recipientId,
      recipientName: rUser.displayName,
      recipientRole: rUser.role,
      content,
      attachments:   processedAttachments,
      isRead:        false,
      createdAt:     new Date().toISOString(),
    };

    // Ensure we are connected and subscribed to this room
    await this._connect();

    if (this._stompConnected && this._stomp?.connected) {
      // ── Primary path: publish to backend ─────────────────────────
      this._stomp.publish({
        destination: '/app/dm.send',
        body: JSON.stringify({
          roomId,
          senderId,
          senderName:    sUser.displayName,
          senderRole:    sUser.role,
          recipientId,
          recipientName: rUser.displayName,
          recipientRole: rUser.role,
          content,
          attachments:   processedAttachments.length > 0 ? processedAttachments : undefined,
        }),
      });
      // Backend will broadcast back to /topic/dm.{roomId} with the DB-stamped message.
      // No need to emit locally here — the broadcast subscription will handle it
      // (the sender is also subscribed to /topic/dm.{roomId}).
    } else {
      // ── Fallback path: local-only (no backend available) ──────────
      console.warn('[dmService] STOMP not connected — falling back to local-only delivery');

      recordDirectMessage(sUser, rUser, optimisticMsg);

      const payload = {
        message:        optimisticMsg,
        conversationId: roomId,
        senderUser:     sUser,
        recipientUser:  rUser,
      };

      this._emit('MESSAGE_RECEIVED', payload);

      this.broadcastChannel?.postMessage({ type: 'MESSAGE_RECEIVED', payload });
    }

    if (recipientPresence === 'OFFLINE') {
      this._triggerOfflineNotification({
        recipientId,
        senderId,
        content: content || `[Sent ${processedAttachments.length} File Attachment(s)]`,
        conversationId: roomId,
      });
    }

    return optimisticMsg;
  }

  /* ── Offline notification ─────────────────────────────────────── */

  _triggerOfflineNotification({ recipientId, senderId, content, conversationId }) {
    this._emit('OFFLINE_NOTIFICATION_DISPATCHED', {
      recipientId,
      senderId,
      snippet:        content.substring(0, 50),
      conversationId,
      timestamp:      new Date().toISOString(),
    });
  }

  /* ── Typing indicators ────────────────────────────────────────── */

  sendTypingIndicator(senderId, recipientId, isTyping) {
    const roomId = getDeterministicRoomId(senderId, recipientId);
    const payload = { senderId, recipientId, conversationId: roomId, isTyping };

    this._emit('TYPING_STATUS_CHANGED', payload);

    this.broadcastChannel?.postMessage({ type: 'TYPING_STATUS_CHANGED', payload });
  }
}

export const dmService = new DirectMessagingService();

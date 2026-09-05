import { getDeterministicRoomId } from '../utils/dmUtils.js';
import { fileToDataURL, recordDirectMessage } from '../models/dmPersistenceModel.js';

/**
 * DirectMessagingService
 *
 * Real-time DM service supporting:
 *  1. In-memory local subscribers (current window)
 *  2. Cross-tab real-time sync via BroadcastChannel (instant messaging across browser tabs)
 *  3. Bidirectional persistence via dmPersistenceModel
 */
class DirectMessagingService {
  constructor() {
    this.listeners = new Set();

    // BroadcastChannel enables real-time messaging across tabs/windows in modern browsers
    this.broadcastChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
      ? new BroadcastChannel('campusconnect_dm_realtime')
      : null;

    if (this.broadcastChannel) {
      this.broadcastChannel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'MESSAGE_RECEIVED' && payload) {
          // Notify in-memory listeners in this tab
          this._emit('MESSAGE_RECEIVED', payload);
        } else if (type === 'TYPING_STATUS_CHANGED' && payload) {
          this._emit('TYPING_STATUS_CHANGED', payload);
        }
      };
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  _emit(event, payload) {
    this.listeners.forEach((listener) => {
      try {
        listener({ event, payload });
      } catch (err) {
        console.error('[dmService] Error in listener:', err);
      }
    });
  }

  async sendDirectMessage({
    senderId,
    recipientId,
    content,
    attachments = [],
    conversationId,
    recipientPresence = 'ONLINE',
    senderUser = null,
    recipientUser = null,
  }) {
    const resolvedRoomId = conversationId || getDeterministicRoomId(senderId, recipientId);

    const processedAttachments = await Promise.all(
      attachments.map(async (att) => ({
        id:   `att_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: att.name,
        size: att.size,
        type: att.type,
        // Convert File object -> permanent base64 data URL so it survives
        // localStorage serialisation and page refreshes.
        url:  att.url || (att.file ? await fileToDataURL(att.file) : ''),
      }))
    );

    const sUser = senderUser || { id: senderId, displayName: senderId, role: 'STUDENT' };
    const rUser = recipientUser || { id: recipientId, displayName: recipientId, role: 'FACULTY' };

    const newMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conversationId: resolvedRoomId,
      senderId,
      senderName: sUser.displayName,
      senderRole: sUser.role,
      recipientId,
      recipientName: rUser.displayName,
      recipientRole: rUser.role,
      content,
      attachments: processedAttachments,
      isRead: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Record bidirectionally so both participants have the conversation in their sidebar
    // and the message in their shared room storage
    recordDirectMessage(sUser, rUser, newMessage);

    const payload = {
      message: newMessage,
      conversationId: resolvedRoomId,
      senderUser: sUser,
      recipientUser: rUser,
      channel: `user_events:${recipientId}`
    };

    // 2. Emit in current tab
    this._emit('MESSAGE_RECEIVED', payload);

    // 3. Broadcast to all other tabs/windows in real-time
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'MESSAGE_RECEIVED',
          payload
        });
      } catch (err) {
        console.warn('[dmService] BroadcastChannel postMessage failed:', err);
      }
    }

    if (recipientPresence === 'OFFLINE') {
      this._triggerOfflineNotification({
        recipientId,
        senderId,
        content: content || `[Sent ${newMessage.attachments.length} File Attachment(s)]`,
        conversationId: resolvedRoomId
      });
    }

    return newMessage;
  }

  _triggerOfflineNotification({ recipientId, senderId, content, conversationId }) {
    this._emit('OFFLINE_NOTIFICATION_DISPATCHED', {
      recipientId,
      senderId,
      snippet: content.substring(0, 50),
      conversationId,
      timestamp: new Date().toISOString()
    });
  }

  sendTypingIndicator(senderId, recipientId, isTyping) {
    const roomId = getDeterministicRoomId(senderId, recipientId);
    const payload = {
      senderId,
      recipientId,
      conversationId: roomId,
      isTyping
    };

    this._emit('TYPING_STATUS_CHANGED', payload);

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'TYPING_STATUS_CHANGED',
          payload
        });
      } catch (err) {
        console.warn('[dmService] BroadcastChannel typing failed:', err);
      }
    }
  }
}

export const dmService = new DirectMessagingService();

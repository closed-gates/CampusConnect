/**
 * usePresenceController.js – Controller hook for the Presence Indicator system.
 *
 * MVC Role: Controller (custom React hook)
 *
 * Opens a dedicated lightweight STOMP session for presence tracking,
 * separate from the chat STOMP session so the two lifecycles are independent.
 *
 * On mount:
 *   1. Connects to /ws via SockJS + STOMP
 *   2. Publishes presence.connect  → backend marks this user ONLINE
 *   3. Subscribes to /topic/presence → receives all ONLINE/OFFLINE deltas
 *   4. Sets a 25s heartbeat interval to keep the TTL alive
 *
 * On unmount (or page unload):
 *   1. Clears heartbeat interval
 *   2. Publishes presence.disconnect → backend marks OFFLINE immediately
 *   3. Deactivates the STOMP client
 *
 * Exported state:
 *   - onlineUsers: Map<userId, { displayName, lastActiveAt }>
 *   - isUserOnline: (userId: string) => boolean
 *
 * Graceful fallback: if the WebSocket is unavailable, the hook resolves
 * silently with an empty onlineUsers map (no errors surfaced to UI).
 *
 * No JSX. No styles.
 *
 * Feature: Online/Offline Presence Indicators
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Client as StompClient } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import {
  PRESENCE_CONNECT_DEST,
  PRESENCE_HEARTBEAT_DEST,
  PRESENCE_DISCONNECT_DEST,
  PRESENCE_TOPIC,
  HEARTBEAT_INTERVAL_MS,
  STATUS_ONLINE,
} from '../models/presenceModel.js'
import { CHAT_WS_URL } from '../models/courseChatModel.js'
import { CURRENT_USER } from '../models/messagingModel.js'

/**
 * usePresenceController
 *
 * @param {object} [currentUser] - Authenticated user, defaults to CURRENT_USER
 * @returns {{ onlineUsers: Map, isUserOnline: (id: string) => boolean }}
 */
export function usePresenceController(currentUser = CURRENT_USER) {
  // Map<userId, { displayName, lastActiveAt }>
  const [onlineUsers, setOnlineUsers] = useState(() => new Map())

  const stompRef     = useRef(null)
  const heartbeatRef = useRef(null)
  const connectedRef = useRef(false)

  /* ── Send helpers (safe to call at any time) ─────────────────── */

  const publishConnect = useCallback((client) => {
    client.publish({
      destination: PRESENCE_CONNECT_DEST,
      body: JSON.stringify({
        userId:      currentUser.id,
        displayName: currentUser.displayName,
        status:      STATUS_ONLINE,
        lastActiveAt: new Date().toISOString(),
      }),
    })
  }, [currentUser.id, currentUser.displayName])

  const publishHeartbeat = useCallback((client) => {
    if (!client?.connected) return
    client.publish({
      destination: PRESENCE_HEARTBEAT_DEST,
      body: JSON.stringify({
        userId:      currentUser.id,
        displayName: currentUser.displayName,
        status:      STATUS_ONLINE,
        lastActiveAt: new Date().toISOString(),
      }),
    })
  }, [currentUser.id, currentUser.displayName])

  const publishDisconnect = useCallback((client) => {
    if (!client?.connected) return
    try {
      client.publish({
        destination: PRESENCE_DISCONNECT_DEST,
        body: JSON.stringify({
          userId:      currentUser.id,
          displayName: currentUser.displayName,
          status:      'OFFLINE',
          lastActiveAt: new Date().toISOString(),
        }),
      })
    } catch (_) { /* ignore — session may already be gone */ }
  }, [currentUser.id, currentUser.displayName])

  /* ── STOMP lifecycle ─────────────────────────────────────────── */

  useEffect(() => {
    const client = new StompClient({
      webSocketFactory: () => new SockJS(CHAT_WS_URL),
      reconnectDelay:   8000,

      onConnect: () => {
        connectedRef.current = true

        // 1. Announce online
        publishConnect(client)

        // 2. Subscribe to all presence deltas
        client.subscribe(PRESENCE_TOPIC, (frame) => {
          try {
            const delta = JSON.parse(frame.body)
            const { userId, displayName, status, lastActiveAt } = delta

            setOnlineUsers(prev => {
              const next = new Map(prev)
              if (status === STATUS_ONLINE) {
                next.set(userId, { displayName, lastActiveAt })
              } else {
                next.delete(userId)
              }
              return next
            })
          } catch (e) {
            console.warn('[usePresenceController] Bad presence frame', e)
          }
        })

        // 3. Start heartbeat
        heartbeatRef.current = setInterval(() => {
          publishHeartbeat(client)
        }, HEARTBEAT_INTERVAL_MS)
      },

      onStompError: () => {
        connectedRef.current = false
      },
      onWebSocketError: () => {
        connectedRef.current = false
      },
      onDisconnect: () => {
        connectedRef.current = false
      },
    })

    stompRef.current = client
    client.activate()

    // Page unload — best effort publish before the socket dies
    const handleUnload = () => publishDisconnect(client)
    window.addEventListener('beforeunload', handleUnload)

    return () => {
      window.removeEventListener('beforeunload', handleUnload)
      clearInterval(heartbeatRef.current)
      publishDisconnect(client)
      client.deactivate()
      stompRef.current    = null
      connectedRef.current = false
    }
  }, [currentUser.id]) // reconnect only if user changes

  /* ── isUserOnline helper ─────────────────────────────────────── */

  const isUserOnline = useCallback(
    (userId) => onlineUsers.has(userId),
    [onlineUsers]
  )

  return { onlineUsers, isUserOnline }
}

/**
 * usePresenceController.js – Controller hook for the Presence Indicator system.
 *
 * MVC Role: Controller (custom React hook)
 *
 * Opens a dedicated lightweight STOMP session for presence tracking,
 * separate from the chat STOMP session so the two lifecycles are independent.
 *
 * Inactivity Rule:
 *   - Users are NOT marked offline immediately upon unmount or closing.
 *   - Activity is tracked via user interactions (mouse, keyboard, scroll, touch).
 *   - While active, heartbeats are sent every 20s.
 *   - After 2 minutes (120s) of inactivity (or tab close), the user is marked OFFLINE.
 *   - Any subsequent interaction brings the user back ONLINE immediately.
 *
 * Exported state:
 *   - onlineUsers: Map<userId, { displayName, lastActiveAt }>
 *   - isUserOnline: (userId: string) => boolean
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
  INACTIVITY_TIMEOUT_MS,
  STATUS_ONLINE,
} from '../models/presenceModel.js'
import { CHAT_WS_URL } from '../models/courseChatModel.js'
import { getCurrentUser } from '../models/messagingModel.js'

/**
 * usePresenceController
 *
 * @param {object} [currentUser] - Authenticated user, defaults to getCurrentUser()
 * @returns {{ onlineUsers: Map, isUserOnline: (id: string) => boolean }}
 */
export function usePresenceController(currentUser = getCurrentUser()) {
  // Map<userId, { displayName, lastActiveAt }>
  const [onlineUsers, setOnlineUsers] = useState(() => new Map())

  const stompRef        = useRef(null)
  const heartbeatRef    = useRef(null)
  const connectedRef    = useRef(false)
  const lastActivityRef = useRef(Date.now())
  const isInactiveRef   = useRef(false)

  /* ── Send helpers (safe to call at any time) ─────────────────── */

  const publishConnect = useCallback((client) => {
    if (!client?.connected) return
    client.publish({
      destination: PRESENCE_CONNECT_DEST,
      body: JSON.stringify({
        userId:       currentUser.id,
        displayName:  currentUser.displayName,
        status:       STATUS_ONLINE,
        lastActiveAt: new Date().toISOString(),
      }),
    })
  }, [currentUser.id, currentUser.displayName])

  const publishHeartbeat = useCallback((client) => {
    if (!client?.connected) return
    client.publish({
      destination: PRESENCE_HEARTBEAT_DEST,
      body: JSON.stringify({
        userId:       currentUser.id,
        displayName:  currentUser.displayName,
        status:       STATUS_ONLINE,
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
          userId:       currentUser.id,
          displayName:  currentUser.displayName,
          status:       'OFFLINE',
          lastActiveAt: new Date().toISOString(),
        }),
      })
    } catch (_) { /* ignore — session may already be gone */ }
  }, [currentUser.id, currentUser.displayName])

  /* ── Inactivity & user interaction detection ─────────────────── */

  useEffect(() => {
    const handleUserInteraction = () => {
      lastActivityRef.current = Date.now()

      // If user was previously idle and marked offline, bring them back online
      if (isInactiveRef.current) {
        isInactiveRef.current = false
        if (stompRef.current && connectedRef.current) {
          publishConnect(stompRef.current)
        }
      }
    }

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart']
    let throttleTimer = null
    const throttledHandler = () => {
      if (!throttleTimer) {
        handleUserInteraction()
        throttleTimer = setTimeout(() => {
          throttleTimer = null
        }, 2000)
      }
    }

    activityEvents.forEach(evt => window.addEventListener(evt, throttledHandler, { passive: true }))

    return () => {
      if (throttleTimer) clearTimeout(throttleTimer)
      activityEvents.forEach(evt => window.removeEventListener(evt, throttledHandler))
    }
  }, [publishConnect])

  /* ── STOMP lifecycle ─────────────────────────────────────────── */

  useEffect(() => {
    const client = new StompClient({
      webSocketFactory: () => new SockJS(CHAT_WS_URL),
      reconnectDelay:   8000,

      onConnect: () => {
        connectedRef.current    = true
        isInactiveRef.current   = false
        lastActivityRef.current = Date.now()

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

        // 3. Periodic heartbeat and 2-min inactivity check
        heartbeatRef.current = setInterval(() => {
          const idleTime = Date.now() - lastActivityRef.current
          if (idleTime >= INACTIVITY_TIMEOUT_MS) {
            // Inactive for 2 minutes or more: mark offline
            if (!isInactiveRef.current) {
              isInactiveRef.current = true
              publishDisconnect(client)
            }
          } else {
            // Active: send heartbeat to keep backend TTL refreshed
            publishHeartbeat(client)
          }
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

    // Notice: We intentionally do NOT call publishDisconnect immediately on beforeunload/unmount.
    // That way, quick page reloads or navigation do NOT flicker the user offline.
    // The backend PresenceStore TTL (120s / 2 minutes) cleanly sweeps them offline
    // if no heartbeats are received within 2 minutes.
    return () => {
      clearInterval(heartbeatRef.current)
      client.deactivate()
      stompRef.current     = null
      connectedRef.current = false
    }
  }, [currentUser.id, publishConnect, publishHeartbeat, publishDisconnect])

  /* ── isUserOnline helper ─────────────────────────────────────── */

  const isUserOnline = useCallback(
    (userId) => onlineUsers.has(userId),
    [onlineUsers]
  )

  return { onlineUsers, isUserOnline }
}

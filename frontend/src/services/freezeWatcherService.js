/**
 * freezeWatcherService.js – WebSocket freeze watcher for active users.
 *
 * Connects via STOMP/SockJS to /topic/account-frozen.{userId}.
 * When an admin freezes this user''s account while they are active,
 * the backend pushes a message here and we show a dialog + sign out.
 */

import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import apiClient from "./apiClient.js"

const WS_URL = "/ws"

/**
 * Subscribe to real-time freeze events for a specific user.
 *
 * @param {string} userId – The logged-in user''s ID.
 * @param {function} onFrozen – Called with { frozen, message } when event arrives.
 * @returns {function} – Call to unsubscribe and disconnect.
 */
export function subscribeToFreezeEvents(userId, onFrozen, onConnected) {
  if (!userId) return () => {}

  const client = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    reconnectDelay: 5000,
    onConnect: () => {
      onConnected?.()
      client.subscribe(`/topic/account-frozen.${userId}`, (frame) => {
        try {
          const payload = JSON.parse(frame.body)
          onFrozen(payload)
        } catch {
          // ignore malformed frames
        }
      })
    },
    onStompError: (frame) => {
      console.warn("[FreezeWatcher] STOMP error:", frame.headers?.message)
    },
  })

  client.activate()

  return () => {
    client.deactivate().catch(() => {})
  }
}

export async function getCurrentFreezeState() {
  const response = await apiClient.get("/api/admin/account-freezes/me")
  if (!response.ok) throw new Error(`Account state request failed (${response.status})`)
  return response.json()
}

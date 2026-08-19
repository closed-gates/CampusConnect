/**
 * useChatController.js – Controller hook for Real-Time Course Chat.
 *
 * MVC Role: Controller (custom React hook)
 *
 * Manages the STOMP/WebSocket connection lifecycle for a single
 * course sub-channel. Integrates with the existing channelService
 * local state as a fallback when the WebSocket is unavailable.
 *
 * Events handled:
 *   - join/leave room (implicit via STOMP subscribe/unsubscribe)
 *   - receive_message  → /topic/course.{courseId}.{subChannelId}
 *   - send_message     → /app/chat.sendMessage
 *   - history_load     → /topic/course.{courseId}.{subChannelId}.history
 *
 * Fallback behaviour:
 *   If the STOMP connection cannot be established within 4 seconds,
 *   the hook switches to local-only mode (using channelService as before)
 *   so the UI remains functional without the backend.
 *
 * No JSX. No styles. Only state + handlers.
 *
 * Feature: Real-Time Course Chat via WebSockets
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Client as StompClient } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import {
  CHAT_WS_URL,
  CHAT_SEND_DEST,
  CHAT_HISTORY_DEST,
  INITIAL_CHAT_STATE,
  buildTopicDestination,
  buildHistoryTopicDestination,
  deriveCourseId,
} from '../models/courseChatModel.js'
import { channelService } from '../services/channelService.js'
import { CURRENT_USER } from '../models/messagingModel.js'

/**
 * useChatController
 *
 * @param {object} channel        - The active channel object (from channelService / messagingController)
 * @param {string} activeSubId    - The currently selected sub-channel id (e.g. "general")
 * @param {object} [currentUser]  - Authenticated user; defaults to CURRENT_USER from messagingModel
 *
 * @returns {{
 *   messages:     Array,
 *   connected:    boolean,
 *   error:        string|null,
 *   sendMessage:  (content: string) => void,
 * }}
 */
export function useChatController(channel, activeSubId, currentUser = CURRENT_USER) {
  const courseId = deriveCourseId(channel?.courseCode || channel?.id || 'unknown')

  const [messages,  setMessages]  = useState([])
  const [connected, setConnected] = useState(false)
  const [error,     setError]     = useState(null)

  // Refs so callbacks always see the latest values without re-creating effects
  const stompClientRef    = useRef(null)
  const subscriptionRef   = useRef(null)
  const histSubRef        = useRef(null)
  const localFallbackRef  = useRef(false)
  const connTimeoutRef    = useRef(null)

  /* ── Load initial messages from local channelService ─────────── */
  useEffect(() => {
    if (!channel?.id || !activeSubId) return
    const localMsgs = channelService.getSubChannelMessages(channel.id, activeSubId)
    setMessages([...localMsgs])
  }, [channel?.id, activeSubId])

  /* ── Subscribe to local channelService events (offline mode) ─── */
  useEffect(() => {
    if (!channel?.id || !activeSubId) return
    const unsub = channelService.subscribe(({ event, payload }) => {
      if (
        event === 'SUB_CHANNEL_MESSAGE' &&
        payload.channelId === channel.id &&
        payload.subId === activeSubId
      ) {
        if (localFallbackRef.current) {
          // Only append from local service if WS is not the source
          setMessages(prev => [...prev, payload.message])
        }
      }
    })
    return () => unsub()
  }, [channel?.id, activeSubId])

  /* ── STOMP connection lifecycle ───────────────────────────────── */
  useEffect(() => {
    if (!channel?.id || !activeSubId) return

    localFallbackRef.current = false

    // 4-second timeout: if not connected, fall back to local mode silently
    connTimeoutRef.current = setTimeout(() => {
      if (!stompClientRef.current?.connected) {
        localFallbackRef.current = true
        setConnected(false)
        setError(null) // silent fallback — no scary error for the user
      }
    }, 4000)

    const topic       = buildTopicDestination(courseId, activeSubId)
    const histTopic   = buildHistoryTopicDestination(courseId, activeSubId)

    const client = new StompClient({
      webSocketFactory: () => new SockJS(CHAT_WS_URL),
      reconnectDelay:   5000,
      onConnect: () => {
        clearTimeout(connTimeoutRef.current)
        setConnected(true)
        setError(null)
        localFallbackRef.current = false

        // Subscribe to real-time broadcast for this sub-channel
        subscriptionRef.current = client.subscribe(topic, (frame) => {
          try {
            const msg = JSON.parse(frame.body)
            // Normalise: ensure createdAt is always a string
            if (msg.createdAt && typeof msg.createdAt === 'object') {
              msg.createdAt = new Date(msg.createdAt).toISOString()
            }
            setMessages(prev => [...prev, msg])
          } catch (e) {
            console.warn('[useChatController] Failed to parse incoming message', e)
          }
        })

        // Subscribe to history topic (one-shot)
        histSubRef.current = client.subscribe(histTopic, (frame) => {
          try {
            const history = JSON.parse(frame.body)
            if (Array.isArray(history) && history.length > 0) {
              // Merge with existing local messages; de-dupe by id
              setMessages(prev => {
                const existingIds = new Set(prev.map(m => m.id))
                const newOnes = history.filter(m => !existingIds.has(m.id))
                return [...newOnes, ...prev].sort(
                  (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                )
              })
            }
            // Unsubscribe from history topic after first delivery
            histSubRef.current?.unsubscribe()
          } catch (e) {
            console.warn('[useChatController] Failed to parse history response', e)
          }
        })

        // Request history for this sub-channel
        client.publish({
          destination: CHAT_HISTORY_DEST,
          body: JSON.stringify({
            courseId,
            subChannelId: activeSubId,
            authorId:     currentUser.id,
            authorName:   currentUser.displayName,
            authorRole:   currentUser.role,
            content:      '',
          }),
        })
      },
      onStompError: (frame) => {
        console.warn('[useChatController] STOMP error', frame)
        setConnected(false)
        setError('WebSocket connection error. Showing local messages.')
        localFallbackRef.current = true
      },
      onWebSocketError: () => {
        setConnected(false)
        localFallbackRef.current = true
      },
    })

    stompClientRef.current = client
    client.activate()

    return () => {
      clearTimeout(connTimeoutRef.current)
      subscriptionRef.current?.unsubscribe()
      histSubRef.current?.unsubscribe()
      client.deactivate()
      stompClientRef.current = null
      setConnected(false)
    }
  }, [courseId, activeSubId, currentUser.id])

  /* ── sendMessage handler ──────────────────────────────────────── */
  const sendMessage = useCallback((content, attachments = []) => {
    const textContent = content?.trim() || ''
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0

    if (!textContent && !hasAttachments) return

    const payload = {
      courseId,
      subChannelId: activeSubId,
      authorId:     currentUser.id,
      authorName:   currentUser.displayName,
      authorRole:   currentUser.role,
      content:      textContent,
      attachments:  hasAttachments ? attachments : undefined,
    }

    if (stompClientRef.current?.connected) {
      // ── Real-time path: publish via STOMP ──────────────────────
      stompClientRef.current.publish({
        destination: CHAT_SEND_DEST,
        body: JSON.stringify(payload),
      })
    } else {
      // ── Local fallback path: write directly to channelService ──
      channelService.sendSubChannelMessage(channel.id, activeSubId, {
        id:          `msg_${Date.now()}`,
        authorId:    currentUser.id,
        authorName:  currentUser.displayName,
        authorRole:  currentUser.role,
        content:     textContent,
        createdAt:   new Date().toISOString(),
        attachments: hasAttachments ? attachments : undefined,
      })
    }
  }, [courseId, activeSubId, channel?.id, currentUser])

  return { messages, connected, error, sendMessage }
}

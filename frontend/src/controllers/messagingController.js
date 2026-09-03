/**
 * messagingController.js – Controller layer for the Direct Messaging feature.
 *
 * MVC Role: Controller
 * Manages all conversation/message state and event handling.
 * Used by DirectMessagingView (replaces DirectMessagingContainer logic).
 */

import { useState, useEffect, useRef } from 'react'
import { getCurrentUser, MOCK_USERS, ADVISOR_CHANNEL } from '../models/messagingModel.js'
import {
  loadConversations, saveConversations,
  loadMessagesMap,   saveMessagesMap,
  loadActiveConvId,  saveActiveConvId,
  loadRoomMessages,
} from '../models/dmPersistenceModel.js'
import { getDeterministicRoomId } from '../utils/dmUtils.js'
import { dmService } from '../services/dmService.js'
import { channelService } from '../services/channelService.js'
import { getStoredUser } from '../models/authModel.js'
import apiClient from '../services/apiClient.js'

/**
 * useMessagingController
 * Manages conversations, messages, typing indicators, and notifications.
 *
 * @param {object} user - The current authenticated user (defaults to CURRENT_USER)
 * @param {function} onMessageSent - Optional callback when a message is sent
 */
export function useMessagingController(user = getCurrentUser(), onMessageSent) {
  // ── Persisted state: load from localStorage on first render ──────
  const userId = user?.id || 'guest'

  const [conversations,    setConversations]    = useState(() => loadConversations(userId))
  const [activeConvId,     setActiveConvId]     = useState(() => loadActiveConvId(userId))
  const [messagesMap,      setMessagesMap]      = useState(() => loadMessagesMap(userId))
  const [typingState,      setTypingState]      = useState({})
  const [notificationToast, setNotificationToast] = useState(null)
  /** Channels: advisor channel always first, then enrollment-based course channels */
  const [channelConvs, setChannelConvs] = useState(
    () => [ADVISOR_CHANNEL, ...channelService.getChannelsForUser(user.id)]
  )
  const [availableUsers, setAvailableUsers] = useState(MOCK_USERS)
  const [loadingUsers,   setLoadingUsers]   = useState(false)

  const prevUserIdRef = useRef(userId)

  // ── Sync state when logged-in user changes (e.g. login as different user) ──
  useEffect(() => {
    if (prevUserIdRef.current !== userId) {
      prevUserIdRef.current = userId
      const userConvs = loadConversations(userId)
      setConversations(userConvs)
      const lastActive = loadActiveConvId(userId)
      setActiveConvId(lastActive || userConvs[0]?.id || null)
      setMessagesMap(loadMessagesMap(userId))
      setChannelConvs([ADVISOR_CHANNEL, ...channelService.getChannelsForUser(userId)])
    }
  }, [userId])

  // ── Persist to localStorage whenever state changes (for the current user) ──
  useEffect(() => {
    if (prevUserIdRef.current === userId) {
      saveConversations(userId, conversations)
    }
  }, [userId, conversations])

  useEffect(() => {
    if (prevUserIdRef.current === userId) {
      saveActiveConvId(userId, activeConvId)
    }
  }, [userId, activeConvId])

  const activeConversation = conversations.find(c => c.id === activeConvId)
    || channelConvs.find(c => c.id === activeConvId)
    || conversations[0]
  const resolvedActiveId   = activeConversation?.id || activeConvId
  const activeRecipient    = activeConversation?.recipient
  const currentMessages    = messagesMap[resolvedActiveId] || loadRoomMessages(resolvedActiveId) || []

  // Ensure activeConvId tracks the active conversation
  useEffect(() => {
    if (!activeConvId && resolvedActiveId) {
      setActiveConvId(resolvedActiveId)
    }
  }, [activeConvId, resolvedActiveId])

  // ── Cross-tab localStorage sync ──────────────────────────────────────────────
  // When another browser tab writes DM data to localStorage, the `storage` event
  // updates messagesMap and conversations immediately without a page refresh.
  useEffect(() => {
    const handleStorage = (e) => {
      if (!e.key) return

      // A message was written to ANY room
      if (e.key.startsWith('cc_dm_room_')) {
        const roomId = e.key.replace('cc_dm_room_', '')
        const freshMessages = loadRoomMessages(roomId)
        setMessagesMap(prev => ({
          ...prev,
          [roomId]: freshMessages
        }))
      }

      // The current user's conversation list was updated
      if (e.key === `cc_dm_conversations_${userId}`) {
        const fresh = loadConversations(userId)
        setConversations(fresh)
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [userId])

  // Subscribe to dmService events (both local and cross-tab via BroadcastChannel)
  useEffect(() => {
    const unsubscribe = dmService.subscribe(({ event, payload }) => {
      if (event === 'MESSAGE_RECEIVED') {
        const { message, conversationId } = payload
        if (!message) return

        // ── Security & Isolation Check ──────────────────────────────────────
        // A message must ONLY be processed in this tab if the current user
        // is either the sender OR the intended recipient. Messages between
        // two other users (e.g. sent in another account/tab) must be discarded!
        const isParticipant =
          message.senderId === user.id ||
          message.recipientId === user.id ||
          (!message.recipientId && (activeRecipient?.id === message.senderId));

        if (!isParticipant) {
          return;
        }

        setMessagesMap(prev => {
          const current = prev[conversationId] || loadRoomMessages(conversationId) || []
          if (current.some(m => m.id === message.id)) return prev
          return {
            ...prev,
            [conversationId]: [...current, message]
          }
        })
        setConversations(prevConvs => {
          const exists = prevConvs.some(c => c.id === conversationId)
          if (!exists) {
            const fresh = loadConversations(userId)
            if (fresh.some(c => c.id === conversationId)) {
              return fresh
            }
            // If not yet in saved list, construct the conversation entry for the recipient
            const otherUser = message.senderId === user.id ? payload.recipientUser : payload.senderUser
            if (otherUser && otherUser.id !== user.id) {
              const newConvEntry = {
                id: conversationId,
                isGroup: false,
                recipient: { ...otherUser },
                lastMessage: message,
                unreadCount: conversationId === resolvedActiveId ? 0 : 1
              }
              const merged = [newConvEntry, ...fresh]
              saveConversations(userId, merged)
              return merged
            }
            return fresh
          }
          return prevConvs.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                lastMessage: message,
                unreadCount: conv.id === resolvedActiveId ? 0 : ((conv.unreadCount || 0) + 1)
              }
            }
            return conv
          })
        })
      } else if (event === 'TYPING_STATUS_CHANGED') {
        const { conversationId, isTyping, senderId: typingSenderId, recipientId: typingRecipientId } = payload
        // Only show the typing bubble when the OTHER person is typing specifically to this user
        if (typingSenderId !== user.id && (!typingRecipientId || typingRecipientId === user.id)) {
          setTypingState(prev => ({ ...prev, [conversationId]: isTyping }))
        }

      } else if (event === 'OFFLINE_NOTIFICATION_DISPATCHED') {
        if (payload.recipientId === user.id) {
          setNotificationToast(`Notification queued for ${payload.recipientId}: "${payload.snippet}"`)
          setTimeout(() => setNotificationToast(null), 4000)
        }
      }
    })
    return () => unsubscribe()
  }, [userId, resolvedActiveId, user.id, activeRecipient?.id])

  // Sync with backend enrolled/advised courses on mount
  useEffect(() => {
    const user = getStoredUser()
    const studentId = user?.userId || 'STU001'

    Promise.all([
      apiClient.get(`/api/registration/my?studentId=${studentId}`).then(r => r.ok ? r.json() : []).catch(() => []),
      apiClient.get(`/api/advisors/student/${studentId}`).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([regCourses, profile]) => {
      const activeCourses = []
      const seen = new Set()

      if (Array.isArray(regCourses)) {
        regCourses.forEach(r => {
          const code = (r.code || r.courseCode || '').toUpperCase().trim()
          const name = r.title || r.courseTitle || r.name || code
          if (code && !seen.has(code)) {
            seen.add(code)
            activeCourses.push({ code, name })
          }
        })
      }

      if (profile && Array.isArray(profile.advisedCourses)) {
        profile.advisedCourses.forEach(ac => {
          const code = (ac.courseCode || ac.code || '').toUpperCase().trim()
          const name = ac.courseTitle || ac.title || ac.name || code
          if (code && !seen.has(code)) {
            seen.add(code)
            activeCourses.push({ code, name })
          }
        })
      }

      const enrolledChannels = channelService.syncUserChannels(studentId, activeCourses)
      setChannelConvs([ADVISOR_CHANNEL, ...enrolledChannels])
    })
  }, [])

  // Fetch real registered users from backend database for Direct Messaging
  useEffect(() => {
    let isMounted = true
    setLoadingUsers(true)
    const currentId = user?.id || user?.userId || ''

    apiClient.get(`/api/users?excludeUserId=${encodeURIComponent(currentId)}`)
      .then(r => r.ok ? r.json() : [])
      .then(users => {
        if (!isMounted) return
        if (Array.isArray(users) && users.length > 0) {
          const formatted = users.map(u => ({
            id: u.userId,
            username: u.userId,
            displayName: u.fullName,
            role: u.role,
            email: u.email,
            isAdvisor: u.isAdvisor,
            status: 'ONLINE',
          }))
          setAvailableUsers(formatted)
        } else {
          setAvailableUsers(MOCK_USERS.filter(u => u.id !== currentId))
        }
      })
      .catch(err => {
        console.warn('Could not fetch real users, falling back to mock users:', err)
        if (isMounted) {
          setAvailableUsers(MOCK_USERS.filter(u => u.id !== currentId))
        }
      })
      .finally(() => {
        if (isMounted) setLoadingUsers(false)
      })

    return () => { isMounted = false }
  }, [user?.id, user?.userId])

  // Subscribe to channelService – push new channel or remove channel on change
  useEffect(() => {
    const unsub = channelService.subscribe(({ event, payload }) => {
      if (event === 'CHANNEL_JOINED') {
        const { channel } = payload
        setChannelConvs(prev => {
          if (prev.find(c => c.id === channel.id)) return prev
          return [...prev, channel]
        })
        setActiveConvId(channel.id)
      } else if (event === 'CHANNEL_LEFT') {
        const { channelId } = payload
        setChannelConvs(prev => prev.filter(c => c.id !== channelId))
      }
    })
    return () => unsub()
  }, [])

  /* ── Handlers ─────────────────────────────────────────────── */

  const handleSendMessage = async (payload) => {
    if (!activeRecipient) return   // channels are read-only in this phase
    const textContent = typeof payload === 'string' ? payload : (payload?.content || '')
    const attachments = typeof payload === 'object' && payload?.attachments ? payload.attachments : []

    const roomTargetId = getDeterministicRoomId(user.id, activeRecipient.id)

    const newMessage = await dmService.sendDirectMessage({
      senderId: user.id,
      recipientId: activeRecipient.id,
      content: textContent,
      attachments,
      conversationId: roomTargetId,
      recipientPresence: activeRecipient.status,
      senderUser: user,
      recipientUser: activeRecipient,
    })

    if (onMessageSent) onMessageSent(newMessage)
  }

  const handleTyping = (isTyping) => {
    if (activeRecipient) {
      dmService.sendTypingIndicator(user.id, activeRecipient.id, isTyping)
    }
  }

  const handleSelectConversation = (convId) => {
    setActiveConvId(convId)
    const fresh = loadRoomMessages(convId)
    if (fresh) {
      setMessagesMap(prev => ({ ...prev, [convId]: fresh }))
    }
    setConversations(prev =>
      prev.map(c => (c.id === convId ? { ...c, unreadCount: 0 } : c))
    )
  }

  const handleStartNewDM = (selectedUser) => {
    const deterministicId = getDeterministicRoomId(user.id, selectedUser.id)
    const existing = conversations.find(c => c.id === deterministicId)
    if (existing) {
      handleSelectConversation(existing.id)
      return
    }
    const newConv = {
      id: deterministicId,
      isGroup: false,
      recipient: selectedUser,
      unreadCount: 0,
      lastMessage: null
    }
    setConversations(prev => [newConv, ...prev])
    setActiveConvId(deterministicId)
  }

  return {
    // State
    conversations,
    activeConvId,
    currentMessages,
    typingState,
    notificationToast,
    // Derived
    activeConversation,
    activeRecipient,
    // Dynamic database users for New DM
    availableUsers,
    loadingUsers,
    currentUser: user,
    // Handlers
    handleSendMessage,
    handleTyping,
    handleSelectConversation,
    handleStartNewDM,
    // Channel convs (auto-provisioned on enrollment)
    channelConvs,
  }
}

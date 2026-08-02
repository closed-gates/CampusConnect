/**
 * messagingController.js – Controller layer for the Direct Messaging feature.
 *
 * MVC Role: Controller
 * Manages all conversation/message state and event handling.
 * Used by DirectMessagingView (replaces DirectMessagingContainer logic).
 */

import { useState, useEffect } from 'react'
import { CURRENT_USER, MOCK_USERS, MOCK_CONVERSATIONS, INITIAL_MESSAGES } from '../models/messagingModel.js'
import { getDeterministicRoomId } from '../utils/dmUtils.js'
import { dmService } from '../services/dmService.js'

/**
 * useMessagingController
 * Manages conversations, messages, typing indicators, and notifications.
 *
 * @param {object} user - The current authenticated user (defaults to CURRENT_USER)
 * @param {function} onMessageSent - Optional callback when a message is sent
 */
export function useMessagingController(user = CURRENT_USER, onMessageSent) {
  const [conversations,    setConversations]    = useState(MOCK_CONVERSATIONS)
  const [activeConvId,     setActiveConvId]     = useState(MOCK_CONVERSATIONS[0].id)
  const [messagesMap,      setMessagesMap]      = useState(INITIAL_MESSAGES)
  const [typingState,      setTypingState]      = useState({})
  const [notificationToast, setNotificationToast] = useState(null)

  const activeConversation = conversations.find(c => c.id === activeConvId) || conversations[0]
  const activeRecipient    = activeConversation?.recipient
  const currentMessages    = messagesMap[activeConvId] || []

  // Subscribe to dmService events
  useEffect(() => {
    const unsubscribe = dmService.subscribe(({ event, payload }) => {
      if (event === 'MESSAGE_RECEIVED') {
        const { message, conversationId } = payload
        setMessagesMap(prev => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), message]
        }))
        setConversations(prevConvs =>
          prevConvs.map(conv => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                lastMessage: message,
                unreadCount: conv.id === activeConvId ? 0 : conv.unreadCount + 1
              }
            }
            return conv
          })
        )
      } else if (event === 'TYPING_STATUS_CHANGED') {
        const { conversationId, isTyping } = payload
        setTypingState(prev => ({ ...prev, [conversationId]: isTyping }))
      } else if (event === 'OFFLINE_NOTIFICATION_DISPATCHED') {
        setNotificationToast(`Notification queued for ${payload.recipientId}: "${payload.snippet}"`)
        setTimeout(() => setNotificationToast(null), 4000)
      }
    })
    return () => unsubscribe()
  }, [activeConvId])

  /* ── Handlers ─────────────────────────────────────────────── */

  const handleSendMessage = async (payload) => {
    if (!activeRecipient) return
    const textContent = typeof payload === 'string' ? payload : (payload?.content || '')
    const attachments = typeof payload === 'object' && payload?.attachments ? payload.attachments : []

    const newMessage = await dmService.sendDirectMessage({
      senderId: user.id,
      recipientId: activeRecipient.id,
      content: textContent,
      attachments,
      conversationId: activeConvId,
      recipientPresence: activeRecipient.status
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
    // Static data passed through for the View
    availableUsers: MOCK_USERS,
    currentUser: user,
    // Handlers
    handleSendMessage,
    handleTyping,
    handleSelectConversation,
    handleStartNewDM,
  }
}

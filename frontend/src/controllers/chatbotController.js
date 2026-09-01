/**
 * chatbotController.js – Controller hook for the AI chatbot widget.
 *
 * MVC Role: Controller
 *
 * Manages:
 *   - Chat open/close state
 *   - Message history (display + API history)
 *   - Input field value
 *   - Loading / error state
 *   - Send handler (calls service, updates messages)
 *
 * No JSX or styling — returns state + actions only.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  createMessage,
  ROLE,
  WELCOME_MESSAGE,
  MAX_HISTORY_TURNS,
} from '../models/chatbotModel.js'
import { sendChatMessage } from '../services/chatbotService.js'

export function useChatbotController() {
  // ── Widget open/close ──────────────────────────────────────────────────────
  const [isOpen,    setIsOpen]    = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inputText, setInputText] = useState('')
  const [error,     setError]     = useState(null)

  // ── Messages (display list) ───────────────────────────────────────────────
  const [messages, setMessages] = useState([WELCOME_MESSAGE])

  // ── Scroll anchor ref ─────────────────────────────────────────────────────
  const bottomRef = useRef(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleOpen  = useCallback(() => setIsOpen(true),  [])
  const handleClose = useCallback(() => setIsOpen(false), [])
  const handleToggle = useCallback(() => setIsOpen(prev => !prev), [])

  const handleInputChange = useCallback((e) => {
    setInputText(e.target.value)
    setError(null)
  }, [])

  /**
   * Build the conversation history array to send to the backend.
   * Excludes the welcome message (system-generated).
   * Limits to MAX_HISTORY_TURNS most recent turns.
   */
  const buildApiHistory = useCallback((currentMessages) => {
    const conversational = currentMessages
      .filter(m => m.role === ROLE.USER || m.role === ROLE.ASSISTANT)
      .filter(m => m.id !== WELCOME_MESSAGE.id)  // exclude welcome message

    const start = Math.max(0, conversational.length - MAX_HISTORY_TURNS)
    return conversational.slice(start).map(m => ({
      role:    m.role,
      content: m.content,
    }))
  }, [])

  /**
   * Send the current input as a user message.
   */
  const handleSend = useCallback(async (textOverride) => {
    const text = (textOverride ?? inputText).trim()
    if (!text || isLoading) return

    setInputText('')
    setError(null)

    // Add user message to display
    const userMsg = createMessage(ROLE.USER, text)
    setMessages(prev => {
      const next = [...prev, userMsg]
      return next
    })
    setIsLoading(true)

    // Add thinking placeholder
    const thinkingMsg = createMessage(ROLE.ASSISTANT, '…')
    setMessages(prev => [...prev, thinkingMsg])

    try {
      // Build history from current messages (before user msg was added, to avoid duplication)
      const historyForApi = buildApiHistory([...messages])

      const data = await sendChatMessage(text, historyForApi)

      // Replace thinking placeholder with real reply
      const assistantMsg = createMessage(ROLE.ASSISTANT, data.reply)
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== thinkingMsg.id)
        return [...filtered, assistantMsg]
      })
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== thinkingMsg.id))
      setError('Connection error. Please try again.')
      // Re-add user message text to input so they can retry
      setInputText(text)
    } finally {
      setIsLoading(false)
    }
  }, [inputText, isLoading, messages, buildApiHistory])

  /**
   * Handle Enter key in the input field.
   */
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  /**
   * Clear chat and reset to welcome message.
   */
  const handleClearChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE])
    setError(null)
    setInputText('')
  }, [])

  return {
    // State
    isOpen,
    isLoading,
    inputText,
    error,
    messages,
    bottomRef,

    // Actions
    handleOpen,
    handleClose,
    handleToggle,
    handleInputChange,
    handleSend,
    handleKeyDown,
    handleClearChat,
  }
}

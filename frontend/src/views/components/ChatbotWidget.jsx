/**
 * ChatbotWidget.jsx – Floating AI chatbot assistant UI component.
 *
 * MVC Role: View (shared component)
 *
 * Renders:
 *   - A floating bubble button (bottom-right) to open/close the chat
 *   - A chat panel with message history, quick prompts, and input area
 *
 * All logic is delegated to useChatbotController().
 * This component contains NO state or business logic of its own.
 */

import './ChatbotWidget.css'
import { useChatbotController } from '../../controllers/chatbotController.js'
import { QUICK_PROMPTS, ROLE } from '../../models/chatbotModel.js'

export default function ChatbotWidget() {
  const {
    isOpen,
    isLoading,
    inputText,
    error,
    messages,
    bottomRef,
    handleToggle,
    handleClose,
    handleInputChange,
    handleSend,
    handleKeyDown,
    handleClearChat,
  } = useChatbotController()

  return (
    <>
      {/* ── Chat Panel ───────────────────────────────────────── */}
      {isOpen && (
        <div
          className="chatbot-panel"
          role="dialog"
          aria-label="CampusConnect AI Assistant"
          aria-modal="true"
        >
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-avatar">🤖</div>
            <div className="chatbot-header-info">
              <div className="chatbot-header-name">CampusConnect AI</div>
              <div className="chatbot-header-status">
                <span className="chatbot-header-status-dot" />
                {isLoading ? 'Thinking…' : 'Online'}
              </div>
            </div>
            <div className="chatbot-header-actions">
              {/* Clear chat */}
              <button
                id="chatbot-clear-btn"
                className="chatbot-icon-btn"
                onClick={handleClearChat}
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                <TrashIcon />
              </button>
              {/* Close */}
              <button
                id="chatbot-close-btn"
                className="chatbot-icon-btn"
                onClick={handleClose}
                title="Close assistant"
                aria-label="Close assistant"
              >
                <CloseIcon />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages" aria-live="polite" aria-label="Conversation">
            {messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick Prompts — only shown when there's only the welcome message */}
          {messages.length <= 1 && (
            <div className="chatbot-quick-prompts" aria-label="Suggested questions">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  id={`chatbot-quick-${i}`}
                  className="chatbot-quick-prompt-btn"
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Error bar */}
          {error && (
            <div className="chatbot-error" role="alert">{error}</div>
          )}

          {/* Input area */}
          <div className="chatbot-input-area">
            <textarea
              id="chatbot-input"
              className="chatbot-input"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your courses…"
              rows={1}
              disabled={isLoading}
              aria-label="Type your message"
              autoComplete="off"
            />
            <button
              id="chatbot-send-btn"
              className="chatbot-send-btn"
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>

          {/* Disclaimer */}
          <div className="chatbot-disclaimer">
            AI responses are scoped to 12 academic topics only
          </div>
        </div>
      )}

      {/* ── Floating Bubble Button ────────────────────────────── */}
      <button
        id="chatbot-bubble-btn"
        className={`chatbot-bubble${isOpen ? ' is-open' : ''}`}
        onClick={handleToggle}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        title="CampusConnect AI Assistant"
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>
    </>
  )
}

/* ── Message Bubble sub-component ──────────────────────────────── */
function MessageBubble({ message }) {
  const isUser   = message.role === ROLE.USER
  const isThinking = message.content === '…'

  const formatTime = (date) => {
    if (!date) return ''
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={`chatbot-msg ${isUser ? 'user' : 'assistant'}`}>
      <div className="chatbot-msg-avatar">
        {isUser ? '👤' : '🤖'}
      </div>
      <div>
        <div className="chatbot-msg-bubble">
          {isThinking ? (
            <div className="chatbot-thinking">
              <span /><span /><span />
            </div>
          ) : (
            message.content
          )}
        </div>
        {!isThinking && (
          <div className="chatbot-msg-time">{formatTime(message.timestamp)}</div>
        )}
      </div>
    </div>
  )
}

/* ── SVG Icons ─────────────────────────────────────────────────── */
function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <line x1="9" y1="10" x2="15" y2="10"/>
      <line x1="12" y1="7" x2="12" y2="13"/>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6"  y1="6" x2="18" y2="18"/>
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )
}

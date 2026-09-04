import { useMessagingController } from '../../../controllers/messagingController.js'
import { usePresenceController } from '../../../controllers/usePresenceController.js'
import { getCurrentUser } from '../../../models/messagingModel.js'
import DMConversationList from './DMConversationList.jsx'
import DMHeader from './DMHeader.jsx'
import DMChatWindow from './DMChatWindow.jsx'
import DMInputArea from './DMInputArea.jsx'
import CourseChatPanel from '../CourseChat/CourseChatPanel.jsx'
import './DirectMessaging.css'

/**
 * DirectMessagingView – View layer for the Direct Messaging feature.
 *
 * MVC Role: View
 * Renders the DM layout (conversation list + chat window).
 * All state and event handling is provided by useMessagingController().
 *
 * Previously: DirectMessagingContainer (mixed controller + view)
 * Now:        Pure rendering component — no business logic here.
 *
 * NavSidebar is intentionally omitted — CampusConnect's shared
 * Sidebar (in MessagingView) handles top-level navigation.
 *
 * @param {object}   user          - Authenticated user (defaults to CURRENT_USER from model)
 * @param {function} onMessageSent - Optional callback when a message is sent
 */
export default function DirectMessagingView({ user, onMessageSent }) {
  // Always resolve the real logged-in user; fall back to the prop only if provided
  const resolvedUser = user || getCurrentUser()
  const {
    conversations,
    activeConvId,
    currentMessages,
    typingState,
    notificationToast,
    activeConversation,
    activeRecipient,
    availableUsers,
    currentUser,
    channelConvs,
    handleSendMessage,
    handleTyping,
    handleSelectConversation,
    handleStartNewDM,
  } = useMessagingController(resolvedUser, onMessageSent)

  // Global presence map — feeds live dots in DMConversationList + CourseChatPanel
  const { onlineUsers } = usePresenceController(resolvedUser)

  // Is the active conversation a course channel?
  const isChannel = activeConvId?.startsWith('ch_')
  const activeChannel = channelConvs.find(c => c.id === activeConvId)

  return (
    /* univ-dm-root: light-theme flex row (no own nav sidebar) */
    <div className="univ-dm-root" style={{ position: 'relative' }}>

      {/* ── Notification toast (CampusConnect teal style) ── */}
      {notificationToast && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'linear-gradient(135deg, #1A9882 0%, #147A68 100%)',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(26,152,130,0.35)',
            zIndex: 999,
          }}
        >
          {notificationToast}
        </div>
      )}

      {/* Column 1 – Conversation list */}
      <DMConversationList
        conversations={conversations}
        channelConvs={channelConvs}
        activeConversationId={activeConvId}
        onSelectConversation={handleSelectConversation}
        availableUsers={availableUsers}
        onStartNewDM={handleStartNewDM}
        onlineUsers={onlineUsers}
      />

      {/* Column 2 – Active chat OR course channel view (real-time WebSocket) */}
      {isChannel && activeChannel ? (
        <CourseChatPanel channel={activeChannel} />
      ) : (
        <main className="univ-message-window">
          <DMHeader
            currentUser={currentUser}
            activeConversation={activeConversation}
            onlineUsers={onlineUsers}
          />

          <DMChatWindow
            messages={currentMessages}
            currentUser={currentUser}
            recipientUser={activeRecipient}
            isTyping={!!typingState[activeConvId]}
          />

          <DMInputArea
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
            recipientName={activeRecipient?.displayName}
          />
        </main>
      )}
    </div>
  )
}

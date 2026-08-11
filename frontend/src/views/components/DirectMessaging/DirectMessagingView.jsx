import { useMessagingController } from '../../../controllers/messagingController.js'
import DMConversationList from './DMConversationList.jsx'
import DMHeader from './DMHeader.jsx'
import DMChatWindow from './DMChatWindow.jsx'
import DMInputArea from './DMInputArea.jsx'
import CourseChannelView from './CourseChannelView.jsx'
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
  } = useMessagingController(user, onMessageSent)

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
      />

      {/* Column 2 – Active chat OR course channel view */}
      {isChannel && activeChannel ? (
        <CourseChannelView channel={activeChannel} />
      ) : (
        <main className="univ-message-window">
          <DMHeader
            currentUser={currentUser}
            activeConversation={activeConversation}
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

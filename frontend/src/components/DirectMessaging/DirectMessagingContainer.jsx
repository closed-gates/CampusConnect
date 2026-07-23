import React, { useState, useEffect } from 'react';
import { CURRENT_USER, MOCK_USERS, MOCK_CONVERSATIONS, INITIAL_MESSAGES } from '../../data/mockData.js';
import { getDeterministicRoomId } from '../../utils/dmUtils.js';
import { dmService } from '../../services/dmService.js';

/* NavSidebar is intentionally omitted — CampusConnect's shared
   Sidebar (in MessagingPage) handles top-level navigation.    */
import DMConversationList from './DMConversationList.jsx';
import DMHeader from './DMHeader.jsx';
import DMChatWindow from './DMChatWindow.jsx';
import DMInputArea from './DMInputArea.jsx';
import './DirectMessaging.css';

export default function DirectMessagingContainer({ user = CURRENT_USER, onMessageSent }) {
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [activeConvId, setActiveConvId] = useState(MOCK_CONVERSATIONS[0].id);
  const [messagesMap, setMessagesMap] = useState(INITIAL_MESSAGES);
  const [typingState, setTypingState] = useState({});
  const [notificationToast, setNotificationToast] = useState(null);

  const activeConversation = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const activeRecipient = activeConversation?.recipient;
  const currentMessages = messagesMap[activeConvId] || [];

  useEffect(() => {
    const unsubscribe = dmService.subscribe(({ event, payload }) => {
      if (event === 'MESSAGE_RECEIVED') {
        const { message, conversationId } = payload;

        setMessagesMap((prev) => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), message]
        }));

        setConversations((prevConvs) =>
          prevConvs.map((conv) => {
            if (conv.id === conversationId) {
              return {
                ...conv,
                lastMessage: message,
                unreadCount: conv.id === activeConvId ? 0 : conv.unreadCount + 1
              };
            }
            return conv;
          })
        );
      } else if (event === 'TYPING_STATUS_CHANGED') {
        const { conversationId, isTyping } = payload;
        setTypingState((prev) => ({ ...prev, [conversationId]: isTyping }));
      } else if (event === 'OFFLINE_NOTIFICATION_DISPATCHED') {
        setNotificationToast(`Notification queued for ${payload.recipientId}: "${payload.snippet}"`);
        setTimeout(() => setNotificationToast(null), 4000);
      }
    });

    return () => unsubscribe();
  }, [activeConvId]);

  const handleSendMessage = async (payload) => {
    if (!activeRecipient) return;

    const textContent = typeof payload === 'string' ? payload : (payload?.content || '');
    const attachments = typeof payload === 'object' && payload?.attachments ? payload.attachments : [];

    const newMessage = await dmService.sendDirectMessage({
      senderId: user.id,
      recipientId: activeRecipient.id,
      content: textContent,
      attachments,
      conversationId: activeConvId,
      recipientPresence: activeRecipient.status
    });

    if (onMessageSent) {
      onMessageSent(newMessage);
    }
  };

  const handleTyping = (isTyping) => {
    if (activeRecipient) {
      dmService.sendTypingIndicator(user.id, activeRecipient.id, isTyping);
    }
  };

  const handleSelectConversation = (convId) => {
    setActiveConvId(convId);
    setConversations((prev) =>
      prev.map((c) => (c.id === convId ? { ...c, unreadCount: 0 } : c))
    );
  };

  const handleStartNewDM = (selectedUser) => {
    const deterministicId = getDeterministicRoomId(user.id, selectedUser.id);

    const existing = conversations.find((c) => c.id === deterministicId);
    if (existing) {
      handleSelectConversation(existing.id);
      return;
    }

    const newConv = {
      id: deterministicId,
      isGroup: false,
      recipient: selectedUser,
      unreadCount: 0,
      lastMessage: null
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(deterministicId);
  };

  return (
    /* univ-dm-root: now a light-theme flex row (no own nav sidebar) */
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
            zIndex: 999
          }}
        >
          {notificationToast}
        </div>
      )}

      {/* Column 1 – Conversation list */}
      <DMConversationList
        conversations={conversations}
        activeConversationId={activeConvId}
        onSelectConversation={handleSelectConversation}
        availableUsers={MOCK_USERS}
        onStartNewDM={handleStartNewDM}
      />

      {/* Column 2 – Active chat */}
      <main className="univ-message-window">
        <DMHeader
          currentUser={user}
          activeConversation={activeConversation}
        />

        <DMChatWindow
          messages={currentMessages}
          currentUser={user}
          recipientUser={activeRecipient}
          isTyping={!!typingState[activeConvId]}
        />

        <DMInputArea
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          recipientName={activeRecipient?.displayName}
        />
      </main>
    </div>
  );
}

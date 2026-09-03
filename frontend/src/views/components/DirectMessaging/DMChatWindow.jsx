import React, { useEffect, useRef } from 'react';
import { formatMessageTime } from '../../../utils/dmUtils.js';
import UserAvatar from './UserAvatar.jsx';

function isImageFile(att) {
  if (!att) return false;
  if (att.type && att.type.startsWith('image/')) return true;
  const name = att.name || '';
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(name);
}

function getFileExt(filename = '') {
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().substring(0, 4).toUpperCase() : 'FILE';
}

export default function DMChatWindow({
  messages = [],
  currentUser,
  recipientUser,
  isTyping
}) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const isFacultyRecipient = recipientUser?.role === 'FACULTY';

  // Strictly filter messages belonging only to this 1-on-1 dialogue between currentUser and recipientUser
  const validMessages = (messages || []).filter((msg) => {
    if (!msg) return false;
    const isFromSelf = msg.senderId === currentUser?.id;
    const isFromRecipient = msg.senderId === recipientUser?.id;

    // If message has explicit recipientId metadata, enforce it
    if (msg.recipientId) {
      return (isFromSelf && msg.recipientId === recipientUser?.id) ||
             (isFromRecipient && msg.recipientId === currentUser?.id);
    }
    // Fallback: must be from either currentUser or recipientUser
    return isFromSelf || isFromRecipient;
  });

  return (
    <div className="univ-msg-feed" ref={scrollRef}>
      <div style={{ textAlign: 'center', padding: '24px 16px', borderBottom: '1px solid var(--color-border, #E5E7EB)', marginBottom: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#ffffff', borderRadius: 12, margin: '16px 16px 8px' }}>
        <div style={{ marginBottom: 12 }}>
          <UserAvatar user={recipientUser} size={64} />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text, #111827)', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span>{recipientUser?.displayName}</span>
          <span className={`role-badge ${isFacultyRecipient ? 'faculty' : 'student'}`}>
            {recipientUser?.role}
          </span>
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-text-sub, #6B7280)', margin: 0 }}>
          This is the start of your direct communication history with {isFacultyRecipient ? 'Faculty Instructor' : 'Student'}{' '}
          <strong>{recipientUser?.displayName}</strong> (@{recipientUser?.username}).
        </p>
      </div>

      {validMessages.length === 0 ? (
        <div className="univ-empty-state">
          <span className="univ-empty-icon">💬</span>
          <h3>No messages yet</h3>
          <p>Send a direct message or share course files below to start chatting with {recipientUser?.displayName}!</p>
        </div>
      ) : (
        validMessages.map((msg) => {
          const isSelf = msg.senderId === currentUser.id;
          const author = isSelf
            ? currentUser
            : (recipientUser?.id === msg.senderId
                ? recipientUser
                : {
                    id: msg.senderId,
                    displayName: msg.senderName || 'Student',
                    role: msg.senderRole || 'STUDENT',
                    avatarUrl: null,
                  });
          const isAuthorFaculty = author?.role === 'FACULTY';
          const isAuthorAdmin   = author?.role === 'ADMIN';
          const hasAttachments = msg.attachments && msg.attachments.length > 0;
          const safeContent = typeof msg.content === 'string' ? msg.content : (msg.content?.content || String(msg.content || ''));

          return (
            <div
              key={msg.id}
              className={`univ-msg-card ${isSelf ? 'self' : ''}`}
            >
              <UserAvatar user={author} size={40} />
              <div className="univ-msg-bubble">
                <div className="univ-msg-header">
                  <span className="univ-msg-author">{author?.displayName}</span>
                  <span className={`role-badge ${isAuthorFaculty ? 'faculty' : isAuthorAdmin ? 'admin' : 'student'}`}>
                    {author?.role}
                  </span>
                  <span className="univ-msg-timestamp">
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>

                {safeContent && <div className="univ-msg-text">{safeContent}</div>}

                {hasAttachments && (
                  <div className="univ-attachment-container">
                    {msg.attachments.map((att, idx) => {
                      if (isImageFile(att) && att.url) {
                        return (
                          <div key={idx} style={{ marginTop: 6, overflow: 'hidden', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', maxWidth: 320 }}>
                            <img
                              src={att.url}
                              alt={att.name || 'Image Attachment'}
                              style={{ display: 'block', width: '100%', maxHeight: 280, objectFit: 'cover' }}
                            />
                          </div>
                        );
                      }
                      return (
                        <div key={idx} className="univ-file-card">
                          <span className="univ-file-ext-badge">{getFileExt(att.name)}</span>
                          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <span style={{ fontSize: 13, fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{att.name}</span>
                            <span style={{ fontSize: 11, opacity: 0.7 }}>{att.size}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}

      {isTyping && (
        <div className="univ-msg-card">
          <UserAvatar user={recipientUser} size={36} />
          <div className="univ-typing-indicator-bubble">
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-dot"></span>
            <span className="typing-text">{recipientUser?.displayName} is typing…</span>
          </div>
        </div>
      )}
    </div>
  );
}

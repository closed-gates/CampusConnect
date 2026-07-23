import React, { useEffect, useRef } from 'react';
import { formatMessageTime } from '../../utils/dmUtils.js';
import UserAvatar from './UserAvatar.jsx';

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

  return (
    <div className="univ-msg-feed" ref={scrollRef}>
      <div style={{ textAlign: 'center', padding: '24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ marginBottom: 12 }}>
          <UserAvatar user={recipientUser} size={64} />
        </div>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 22, color: '#f8fafc', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span>{recipientUser?.displayName}</span>
          <span className={`role-badge ${isFacultyRecipient ? 'faculty' : 'student'}`}>
            {recipientUser?.role}
          </span>
        </h2>
        <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
          This is the start of your direct communication history with {isFacultyRecipient ? 'Faculty Instructor' : 'Student'}{' '}
          <strong>{recipientUser?.displayName}</strong> (@{recipientUser?.username}).
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="univ-empty-state">
          <span className="univ-empty-icon">💬</span>
          <h3>No messages yet</h3>
          <p>Send a direct message or share course files below to start chatting with {recipientUser?.displayName}!</p>
        </div>
      ) : (
        messages.map((msg) => {
          const isSelf = msg.senderId === currentUser.id;
          const author = isSelf ? currentUser : recipientUser;
          const isAuthorFaculty = author?.role === 'FACULTY';
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
                  <span className={`role-badge ${isAuthorFaculty ? 'faculty' : 'student'}`}>
                    {author?.role}
                  </span>
                  <span className="univ-msg-timestamp">
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </div>

                {safeContent && <div className="univ-msg-text">{safeContent}</div>}

                {hasAttachments && (
                  <div className="univ-attachment-container">
                    {msg.attachments.map((att, attIdx) => {
                      const isImage = att.type?.startsWith('image/') || /\.(png|jpe?g|gif|webp)$/i.test(att.name);
                      const fileExt = getFileExt(att.name);

                      if (isImage) {
                        return (
                          <div key={attIdx} style={{ marginTop: 4 }}>
                            <img
                              src={att.url}
                              alt={att.name}
                              className="univ-image-preview"
                            />
                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                              📷 {att.name} ({att.size || 'Image'})
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={attIdx} className="univ-file-card">
                          <div className="univ-file-ext-badge">{fileExt}</div>
                          <div className="univ-file-info">
                            <div className="univ-file-name" title={att.name}>{att.name}</div>
                            <div className="univ-file-size">{att.size || 'Attachment'}</div>
                          </div>
                          <a
                            href={att.url}
                            download={att.name}
                            className="univ-file-download-btn"
                            title={`Download ${att.name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            📥
                          </a>
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
        <div className="univ-typing-bar">
          <span><strong>{recipientUser?.displayName}</strong> is typing...</span>
        </div>
      )}
    </div>
  );
}

function getFileExt(filename) {
  if (!filename) return 'FILE';
  const parts = filename.split('.');
  return parts.length > 1 ? parts.pop().toUpperCase() : 'FILE';
}

import React, { useState } from 'react';
import { getPresenceColor, formatMessageTime } from '../../utils/dmUtils.js';
import UserAvatar from './UserAvatar.jsx';

export default function DMConversationList({
  conversations,
  activeConversationId,
  onSelectConversation,
  availableUsers,
  onStartNewDM
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('ALL');
  const [showUserModal, setShowUserModal] = useState(false);

  const filteredConversations = conversations.filter((conv) => {
    const recipient = conv.recipient;
    const matchesSearch =
      recipient?.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipient?.username.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'FACULTY') return recipient?.role === 'FACULTY';
    if (filterTab === 'STUDENTS') return recipient?.role === 'STUDENT';
    return true;
  });

  const facultyConvs = filteredConversations.filter((c) => c.recipient?.role === 'FACULTY');
  const studentConvs = filteredConversations.filter((c) => c.recipient?.role === 'STUDENT' || c.recipient?.role !== 'FACULTY');

  return (
    <aside className="univ-chats-sidebar">
      <div className="univ-chats-header">
        <h2 className="univ-chats-title">Direct Messages</h2>
        <button
          className="univ-new-dm-btn"
          onClick={() => setShowUserModal(!showUserModal)}
          title="Start a new Faculty or Student message"
        >
          <span>+ New DM</span>
        </button>
      </div>

      {showUserModal && (
        <div style={{ padding: '10px 16px', background: '#0b192c', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', marginBottom: 8, letterSpacing: '0.5px' }}>
            SELECT FACULTY OR STUDENT TO MESSAGE:
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {availableUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => {
                  onStartNewDM(user);
                  setShowUserModal(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 13,
                  minHeight: 44
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(30,58,138,0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <UserAvatar user={user} size={30} />
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>{user.displayName}</span>
                    <span className={`role-badge ${user.role === 'FACULTY' ? 'faculty' : 'student'}`}>
                      {user.role}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>@{user.username}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="univ-search-wrapper">
        <div className="univ-search-input-box">
          <span style={{ fontSize: 14, color: '#94a3b8' }}>🔍</span>
          <input
            type="text"
            placeholder="Search faculty or students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="univ-filter-tabs">
        <button
          className={`univ-tab-btn ${filterTab === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilterTab('ALL')}
        >
          All
        </button>
        <button
          className={`univ-tab-btn ${filterTab === 'FACULTY' ? 'active' : ''}`}
          onClick={() => setFilterTab('FACULTY')}
        >
          🎓 Faculty
        </button>
        <button
          className={`univ-tab-btn ${filterTab === 'STUDENTS' ? 'active' : ''}`}
          onClick={() => setFilterTab('STUDENTS')}
        >
          👥 Students
        </button>
      </div>

      <div className="univ-chat-list">
        {filteredConversations.length === 0 ? (
          <div style={{ padding: '30px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            <p>No conversations found matching <strong>"{searchQuery || filterTab.toLowerCase()}"</strong>.</p>
          </div>
        ) : (
          <>
            {facultyConvs.length > 0 && (
              <>
                <div className="univ-category-label">
                  <span>🎓 Faculty Members ({facultyConvs.length})</span>
                </div>
                {facultyConvs.map((conv) => renderChatItem(conv, activeConversationId, onSelectConversation))}
              </>
            )}

            {studentConvs.length > 0 && (
              <>
                <div className="univ-category-label" style={{ marginTop: facultyConvs.length > 0 ? 12 : 0 }}>
                  <span>👥 Students ({studentConvs.length})</span>
                </div>
                {studentConvs.map((conv) => renderChatItem(conv, activeConversationId, onSelectConversation))}
              </>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

function renderChatItem(conv, activeConvId, onSelectConversation) {
  const isActive = conv.id === activeConvId;
  const recipient = conv.recipient;
  const presenceColor = getPresenceColor(recipient?.status);
  const isFaculty = recipient?.role === 'FACULTY';

  return (
    <div
      key={conv.id}
      className={`univ-chat-item ${isActive ? 'active' : ''}`}
      onClick={() => onSelectConversation(conv.id)}
    >
      <div className="univ-avatar-frame">
        <UserAvatar user={recipient} size={42} />
        <span
          className="univ-presence-badge"
          style={{ backgroundColor: presenceColor }}
          title={`Status: ${recipient?.status}`}
        />
      </div>

      <div className="univ-chat-meta">
        <div className="univ-chat-top-line">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
            <span className="univ-chat-name">{recipient?.displayName}</span>
            <span className={`role-badge ${isFaculty ? 'faculty' : 'student'}`}>
              {recipient?.role}
            </span>
          </div>
          {conv.lastMessage && (
            <span className="univ-chat-time">
              {formatMessageTime(conv.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="univ-chat-preview">
          {conv.lastMessage?.content || 'Started a new direct message'}
        </div>
      </div>

      {conv.unreadCount > 0 && !isActive && (
        <span className="univ-badge-count">{conv.unreadCount}</span>
      )}
    </div>
  );
}

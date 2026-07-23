import React from 'react';
import UserAvatar from './UserAvatar.jsx';

export default function NavSidebar({ currentUser }) {
  return (
    <aside className="univ-nav-sidebar">
      <div className="univ-nav-top">
        <div className="univ-brand-crest" title="CampusConnect - Direct Messaging">
          CC
        </div>

        <button
          className="univ-nav-item active"
          title="Direct Messages"
          aria-label="Direct Messages"
        >
          💬
        </button>

        <button
          className="univ-nav-item"
          title="Course Channels"
          aria-label="Course Channels"
        >
          📚
        </button>

        <button
          className="univ-nav-item"
          title="Announcements"
          aria-label="Announcements"
        >
          📢
        </button>

        <button
          className="univ-nav-item"
          title="Class Schedule"
          aria-label="Class Schedule"
        >
          📅
        </button>
      </div>

      <div className="univ-nav-bottom">
        <button
          className="univ-nav-item"
          title="Settings"
          aria-label="Settings"
        >
          ⚙️
        </button>

        <div style={{ cursor: 'pointer' }} title={`${currentUser.displayName} (@${currentUser.username})`}>
          <UserAvatar user={currentUser} size={44} />
        </div>
      </div>
    </aside>
  );
}

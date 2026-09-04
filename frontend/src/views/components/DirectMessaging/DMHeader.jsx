import React from 'react';
import UserAvatar from './UserAvatar.jsx';

/**
 * DMHeader
 *
 * Shows the recipient's avatar, name, role badge, and a live presence dot.
 * Presence is driven by the `onlineUsers` Map from usePresenceController —
 * a green dot means the backend received a heartbeat from that user in the
 * last 60 seconds; grey means offline / no signal.
 *
 * MVC Role: View (pure rendering, no state)
 */
export default function DMHeader({ activeConversation, onlineUsers }) {
  if (!activeConversation) return null;

  const recipient  = activeConversation.recipient;
  const isFaculty  = recipient?.role === 'FACULTY';

  // Derive presence from the live STOMP-backed map
  const isOnline     = onlineUsers?.has(recipient?.id) ?? false;
  const presenceColor = isOnline ? '#10b981' : '#94a3b8';
  const presenceLabel = isOnline ? 'Online' : 'Offline';

  return (
    <header className="univ-window-header">
      <div className="univ-header-user">
        <div className="univ-avatar-frame" style={{ width: 44, height: 44 }}>
          <UserAvatar user={recipient} size={44} />
          <span
            className="univ-presence-badge"
            style={{ backgroundColor: presenceColor, width: 12, height: 12 }}
            title={`${recipient?.displayName} is ${presenceLabel}`}
          />
        </div>

        <div className="univ-header-details">
          <h3>
            <span>{recipient?.displayName}</span>
            <span className={`role-badge ${isFaculty ? 'faculty' : 'student'}`}>
              {recipient?.role}
            </span>
          </h3>
          <p>
            @{recipient?.username} • {recipient?.title || (isFaculty ? 'Faculty Member' : 'Student')}
            <span
              style={{
                marginLeft: 8,
                fontSize: 11,
                color: presenceColor,
                fontWeight: 600,
                letterSpacing: '0.03em',
              }}
            >
              ● {presenceLabel}
            </span>
          </p>
        </div>
      </div>
    </header>
  );
}

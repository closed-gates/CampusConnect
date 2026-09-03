import React, { useState } from 'react';
import { getPresenceColor, getDeterministicRoomId } from '../../../utils/dmUtils.js';
import UserAvatar from './UserAvatar.jsx';

export default function DMHeader({ currentUser, activeConversation }) {
  const [showKeyDetails, setShowKeyDetails] = useState(false);

  if (!activeConversation) return null;

  const recipient = activeConversation.recipient;
  const presenceColor = getPresenceColor(recipient?.status);
  const isFaculty = recipient?.role === 'FACULTY';

  const deterministicKey = activeConversation.isGroup
    ? activeConversation.id
    : getDeterministicRoomId(currentUser.id, recipient.id);

  return (
    <header className="univ-window-header">
      <div className="univ-header-user">
        <div className="univ-avatar-frame" style={{ width: 44, height: 44 }}>
          <UserAvatar user={recipient} size={44} />
          <span
            className="univ-presence-badge"
            style={{ backgroundColor: presenceColor, width: 12, height: 12 }}
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
          </p>
        </div>
      </div>

      <div>
        <button
          className="univ-key-badge"
          onClick={() => setShowKeyDetails(!showKeyDetails)}
          title="Click to view Deterministic WebSocket Room Key"
        >
          <span>🔑</span>
          <span>{showKeyDetails ? `Room: ${deterministicKey}` : `Key: ${deterministicKey.substring(0, 18)}...`}</span>
        </button>
      </div>
    </header>
  );
}

/**
 * Direct Messaging Helper Utilities
 */

export function getDeterministicRoomId(userAId, userBId) {
  if (!userAId || !userBId) {
    throw new Error('Both userAId and userBId are required to generate a deterministic room ID.');
  }
  const minId = userAId < userBId ? userAId : userBId;
  const maxId = userAId > userBId ? userAId : userBId;
  return `dm_${minId}_${maxId}`;
}

export function formatMessageTime(dateInput) {
  const date = new Date(dateInput);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return timeStr;
  }
  if (isYesterday) {
    return `Yesterday at ${timeStr}`;
  }
  return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
}

export function formatConversationTime(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) {
    return timeStr;
  }
  if (isYesterday) {
    return 'Yesterday';
  }
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function getPresenceColor(status) {
  if (status?.toUpperCase() === 'ONLINE') {
    return '#10b981'; // Green for Online
  }
  return '#94a3b8'; // Ash/Grey for Offline
}

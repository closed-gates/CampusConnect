/**
 * channelAccessModel.js – Model layer for Course Channel Access & Membership.
 *
 * MVC Role: Model
 *
 * Pure schema, constants, and helper functions for channel access control.
 * No JSX, state hooks, or component styling.
 */

export const CHANNEL_ROLES = {
  ALL:     'ALL',
  FACULTY: 'FACULTY',
  STUDENT: 'STUDENT',
};

/**
 * Normalizes a user or member object to a uniform shape.
 */
export function normalizeChannelMember(raw) {
  if (!raw) return null;
  const id = raw.id || raw.userId || '';
  const role = (raw.role || raw.userRole || 'STUDENT').toUpperCase();
  const displayName = raw.displayName || raw.userName || raw.fullName || id;
  const email = raw.email || raw.userEmail || '';
  const username = raw.username || email || id;

  return {
    id,
    userId: id,
    displayName,
    username,
    email,
    role,
    status: raw.status || 'ONLINE',
    addedBy: raw.addedBy || 'SYSTEM',
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
}

/**
 * Filters a list of members by search query and role.
 */
export function filterMembers(members, query = '', roleFilter = 'ALL') {
  if (!Array.isArray(members)) return [];
  const q = query.toLowerCase().trim();

  return members.filter((m) => {
    if (!m) return false;

    // Role filtering
    if (roleFilter === CHANNEL_ROLES.FACULTY && m.role !== 'FACULTY') return false;
    if (roleFilter === CHANNEL_ROLES.STUDENT && m.role !== 'STUDENT') return false;

    // Search query
    if (!q) return true;
    return (
      (m.displayName && m.displayName.toLowerCase().includes(q)) ||
      (m.username && m.username.toLowerCase().includes(q)) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.id && m.id.toLowerCase().includes(q))
    );
  });
}

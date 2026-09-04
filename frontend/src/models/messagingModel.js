/**
 * messagingModel.js – Model layer for the Direct Messaging feature.
 *
 * MVC Role: Model
 * Centralizes messaging data and session identity under the models/ layer.
 *
 * NOTE: CURRENT_USER has been removed. All identity is read at call-time
 * from localStorage via getCurrentUser(). This eliminates the stale-module-
 * load bug where the role/id were frozen at import time as 'STUDENT'.
 */

import { getStoredUser } from './authModel.js'

/**
 * getCurrentUser()
 *
 * Returns the authenticated user for the current session by reading
 * from localStorage (populated by storeAuth() on login).
 *
 * Called at the moment a message is sent / a component mounts — never
 * cached at module-load time. This is the single source of truth for
 * authorId, authorName, and authorRole on every outgoing message.
 *
 * MVC Role: Model helper — pure function, no side effects.
 */
export function getCurrentUser() {
  const stored = getStoredUser()
  if (stored && stored.userId) {
    return {
      id:          stored.userId,
      username:    stored.email    || stored.userId,
      displayName: stored.fullName || stored.userId,
      role:        stored.role     || 'STUDENT',
      status:      'ONLINE',
    }
  }
  // Unauthenticated fallback — should never reach production with a real login
  return {
    id:          'guest',
    username:    'guest',
    displayName: 'Guest',
    role:        'STUDENT',
    status:      'ONLINE',
  }
}

export const MOCK_USERS = [
  {
    id: 'usr_faculty_001',
    username: 'dr_mahbub',
    displayName: 'Dr. Mahbubur Rahman',
    role: 'FACULTY',
    title: 'Professor & CSE470 Lead Faculty',
    department: 'Dept. of Computer Science & Eng.',
    avatarUrl: null,
    status: 'ONLINE',
    customStatus: 'Office Hours: 2:00 PM - 4:00 PM'
  },
  {
    id: 'usr_faculty_002',
    username: 'prof_farhana',
    displayName: 'Prof. Farhana Ahmed',
    role: 'FACULTY',
    title: 'Associate Professor',
    department: 'Dept. of Computer Science & Eng.',
    avatarUrl: null,
    status: 'OFFLINE',
    customStatus: 'In Lecture Hall 3'
  },
  {
    id: 'usr_alex_002',
    username: 'alex_dev',
    displayName: 'Alex Rivers',
    role: 'STUDENT',
    title: 'CSE470 Team Member',
    department: 'Computer Science & Engineering',
    avatarUrl: null,
    status: 'ONLINE',
    customStatus: 'Reviewing PRs'
  },
  {
    id: 'usr_sarah_003',
    username: 'sarah_m',
    displayName: 'Sarah Miller',
    role: 'STUDENT',
    title: 'CSE470 Classmate',
    department: 'Computer Science & Engineering',
    avatarUrl: null,
    status: 'OFFLINE',
    customStatus: 'Offline'
  },
  {
    id: 'usr_david_004',
    username: 'david_k',
    displayName: 'David Kim',
    role: 'STUDENT',
    title: 'CSE470 Classmate',
    department: 'Computer Science & Engineering',
    avatarUrl: null,
    status: 'OFFLINE',
    customStatus: 'Offline'
  }
]


// MOCK_CONVERSATIONS and INITIAL_MESSAGES have been removed.
// The conversation list is populated at runtime:
//   - DM conversations are built dynamically when the user starts a new DM.
//   - The controller initialises with an empty conversations array [].
//   - MOCK_USERS below serves only as a fallback when GET /api/users fails.


/**
 * ADVISOR_CHANNEL – Permanent advisor channel always visible in the DM sidebar.
 * Not tied to course enrollment — always present for all users.
 */
export const ADVISOR_CHANNEL = {
  id: 'ch_advisor_001',
  isAdvisorChannel: true,
  name: '🎓 Advisor Channel',
  emoji: '🎓',
  displayName: 'Academic Advising — message your advisor here',
  unreadCount: 0,
  lastMessage: {
    content: 'Welcome! Use this channel to communicate with your academic advisor.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
}

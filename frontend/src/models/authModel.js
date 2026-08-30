/**
 * authModel.js – Model layer for authentication.
 *
 * MVC Role: Model
 *
 * Contains:
 *   - Initial form state shapes
 *   - Role constants
 *   - localStorage helpers for JWT and user info
 */

// ── Role constants ────────────────────────────────────────────────────────────

export const ROLES = {
  STUDENT: 'STUDENT',
  FACULTY: 'FACULTY',
  ADMIN:   'ADMIN',
}

export const ROLE_LABELS = {
  STUDENT: '🎓 Student',
  FACULTY: '👨‍🏫 Faculty',
  ADMIN:   '🛡️ Admin',
}

// ── Initial form state shapes ─────────────────────────────────────────────────

/** Initial state for the Login form */
export const INITIAL_LOGIN_FORM = {
  identifier: '',   // userId OR email
  password:   '',
  remember:   false,
}

/** Initial state for the Signup form */
export const INITIAL_SIGNUP_FORM = {
  fullName:        '',
  userId:          '',
  email:           '',
  password:        '',
  confirmPassword: '',
  role:            'STUDENT',
}

// ── localStorage token helpers ────────────────────────────────────────────────

const KEYS = {
  TOKEN:     'cc_token',
  ROLE:      'cc_role',
  USER_ID:   'cc_userId',
  FULL_NAME: 'cc_fullName',
  EMAIL:     'cc_email',
  EXPIRES:   'cc_expires',
}

/**
 * Persist the full auth payload after a successful login / registration.
 * @param {{ token, role, userId, fullName, email, expiresIn }} payload
 */
export function storeAuth(payload) {
  localStorage.setItem(KEYS.TOKEN,     payload.token)
  localStorage.setItem(KEYS.ROLE,      payload.role)
  localStorage.setItem(KEYS.USER_ID,   payload.userId)
  localStorage.setItem(KEYS.FULL_NAME, payload.fullName)
  localStorage.setItem(KEYS.EMAIL,     payload.email)
  // Store absolute expiry timestamp
  const expiresAt = Date.now() + (payload.expiresIn || 86400000)
  localStorage.setItem(KEYS.EXPIRES, String(expiresAt))
  // Legacy key — kept for backward compatibility with existing code
  localStorage.setItem('userRole', payload.role)
}

/** Remove all auth data from localStorage (used on logout / token expiry). */
export function clearAuth() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k))
  localStorage.removeItem('userRole')
}

/** @returns {string|null} The stored JWT token, or null if not present. */
export function getStoredToken() {
  return localStorage.getItem(KEYS.TOKEN)
}

/** @returns {string|null} The stored role (STUDENT|FACULTY|ADMIN), or null. */
export function getStoredRole() {
  return localStorage.getItem(KEYS.ROLE)
}

/** @returns {{ userId, fullName, email, role }|null} Stored user info object. */
export function getStoredUser() {
  const token = getStoredToken()
  if (!token) return null
  return {
    userId:   localStorage.getItem(KEYS.USER_ID)   || '',
    fullName: localStorage.getItem(KEYS.FULL_NAME) || '',
    email:    localStorage.getItem(KEYS.EMAIL)     || '',
    role:     localStorage.getItem(KEYS.ROLE)      || '',
  }
}

/**
 * Check if the stored token is still valid (not expired).
 * @returns {boolean}
 */
export function isTokenValid() {
  const token   = getStoredToken()
  const expires = localStorage.getItem(KEYS.EXPIRES)
  if (!token || !expires) return false
  return Date.now() < Number(expires)
}

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
  TOKEN:      'cc_token',
  ROLE:       'cc_role',
  USER_ID:    'cc_userId',
  FULL_NAME:  'cc_fullName',
  EMAIL:      'cc_email',
  EXPIRES:    'cc_expires',
  IS_ADVISOR: 'cc_isAdvisor',
}

const CANONICAL_ACCOUNT_NAMES = {
  STU001: 'Alex Johnson',
}

/** Resolve names for built-in accounts whose older demo data used another identity. */
export function getCanonicalFullName(userId, fullName = '') {
  return CANONICAL_ACCOUNT_NAMES[String(userId || '').toUpperCase()] || fullName
}

/**
 * Persist the full auth payload after a successful login / registration.
 * @param {{ token, role, userId, fullName, email, expiresIn, isAdvisor }} payload
 */
export function storeAuth(payload) {
  const fullName = getCanonicalFullName(payload.userId, payload.fullName)
  localStorage.setItem(KEYS.TOKEN,      payload.token)
  localStorage.setItem(KEYS.ROLE,       payload.role)
  localStorage.setItem(KEYS.USER_ID,    payload.userId)
  localStorage.setItem(KEYS.FULL_NAME,  fullName)
  localStorage.setItem(KEYS.EMAIL,      payload.email)
  localStorage.setItem(KEYS.IS_ADVISOR, payload.isAdvisor ? 'true' : 'false')
  // Store absolute expiry timestamp
  const expiresAt = Date.now() + (payload.expiresIn || 86400000)
  localStorage.setItem(KEYS.EXPIRES, String(expiresAt))
  // Legacy key — kept for backward compatibility with existing code
  localStorage.setItem('userRole', payload.role)
  localStorage.setItem('isAdvisor', payload.isAdvisor ? 'true' : 'false')
}

/** Remove all auth data from localStorage (used on logout / token expiry). */
export function clearAuth() {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k))
  localStorage.removeItem('userRole')
  localStorage.removeItem('isAdvisor')
}

/** @returns {string|null} The stored JWT token, or null if not present. */
export function getStoredToken() {
  return localStorage.getItem(KEYS.TOKEN)
}

/** @returns {string|null} The stored role (STUDENT|FACULTY|ADMIN), or null. */
export function getStoredRole() {
  return localStorage.getItem(KEYS.ROLE)
}

/** @returns {{ userId, fullName, email, role, isAdvisor: boolean }|null} Stored user info object. */
export function getStoredUser() {
  const token = getStoredToken()
  if (!token) return null
  const userId = localStorage.getItem(KEYS.USER_ID) || ''
  const storedFullName = localStorage.getItem(KEYS.FULL_NAME) || ''
  return {
    userId,
    fullName:  getCanonicalFullName(userId, storedFullName),
    email:     localStorage.getItem(KEYS.EMAIL)      || '',
    role:      localStorage.getItem(KEYS.ROLE)       || '',
    isAdvisor: localStorage.getItem(KEYS.IS_ADVISOR) === 'true',
  }
}

/** @returns {boolean} Whether the logged-in user has Advisor authorization */
export function isUserAdvisor() {
  return localStorage.getItem(KEYS.IS_ADVISOR) === 'true' || localStorage.getItem('isAdvisor') === 'true'
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

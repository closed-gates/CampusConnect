/**
 * accountSettingsModel.js - Model layer for Account Preferences & Settings.
 *
 * MVC Role: Model
 *
 * Contains: initial state shapes, constants, pure helpers.
 * No JSX, no hooks, no side effects.
 */

// ── Role display config ────────────────────────────────────────────────────────

export const ROLE_CONFIG = {
  STUDENT: { label: 'Student',  color: '#1A9882', bg: '#E6F5F2', icon: '🎓' },
  FACULTY: { label: 'Faculty',  color: '#7C3AED', bg: '#EDE9FE', icon: '👨‍🏫' },
  ADMIN:   { label: 'Admin',    color: '#DC2626', bg: '#FEE2E2', icon: '🛡️' },
}

// ── Year labels for display ────────────────────────────────────────────────────

export const YEAR_LABELS = {
  1: '1st Year',
  2: '2nd Year',
  3: '3rd Year',
  4: '4th Year',
}

// ── Standing labels derived from CGPA ─────────────────────────────────────────

export const STANDING_CONFIG = [
  { min: 3.5, label: 'High Standing',   color: '#10B981', bg: '#D1FAE5' },
  { min: 2.0, label: 'Good Standing',   color: '#F59E0B', bg: '#FEF3C7' },
  { min: 0.0, label: 'Probationary',    color: '#EF4444', bg: '#FEE2E2' },
]

// ── Preference constants ───────────────────────────────────────────────────────

export const PREFERENCE_STORAGE_KEY = 'cc_preferences'
export const PREFERENCE_CHANGE_EVENT = 'campusconnect:preferences-changed'
export const DEFAULT_PREFERENCES = {
  theme: 'light',
  accent: 'teal',
  notificationsMuted: false,
  emailNotifications: { assignments: true, grades: true, advising: true, exams: true, announcements: true },
  accessibility: { fontSize: 'normal', highContrast: false },
  academic: { semester: 'Fall 2026', courseView: 'grid', dashboardExams: true },
  calendar: { weekStartsOn: 'sunday', reminderHours: 24 },
  avatar: '',
}

// ── Initial state shapes ───────────────────────────────────────────────────────

/** Shape of the profile object populated from the API */
export const INITIAL_PROFILE = {
  userId:           '',
  fullName:         '',
  email:            '',
  role:             '',
  createdAt:        '',
  isAdvisor:        false,
  // student-only (null for faculty/admin)
  department:       null,
  year:             null,
  cgpa:             null,
  completedCredits: null,
  onProbation:      null,
  courseLimit:      null,
  creditLimit:      null,
}

/** Shape of the edit profile form */
export const INITIAL_EDIT_FORM = {
  fullName: '',
  email:    '',
}

/** Shape of the change-password form */
export const INITIAL_PASSWORD_FORM = {
  currentPassword: '',
  newPassword:     '',
  confirmPassword: '',
}

/** Default preferences loaded from localStorage */
export function loadPreferences() {
  try {
    const raw = localStorage.getItem(PREFERENCE_STORAGE_KEY)
    if (raw) {
      const stored = JSON.parse(raw)
      return {
        ...DEFAULT_PREFERENCES,
        theme: ['light', 'dark', 'system'].includes(stored.theme) ? stored.theme : 'light',
        accent: stored.accent || DEFAULT_PREFERENCES.accent,
        notificationsMuted: typeof stored.notificationsMuted === 'boolean'
          ? stored.notificationsMuted
          : stored.notificationSound === false,
        emailNotifications: { ...DEFAULT_PREFERENCES.emailNotifications, ...stored.emailNotifications },
        accessibility: {
          fontSize: stored.accessibility?.fontSize || DEFAULT_PREFERENCES.accessibility.fontSize,
          highContrast: stored.accessibility?.highContrast === true,
        },
        academic: { ...DEFAULT_PREFERENCES.academic, ...stored.academic },
        calendar: { ...DEFAULT_PREFERENCES.calendar, ...stored.calendar },
        avatar: stored.avatar || '',
      }
    }
  } catch { /* ignore malformed or unavailable storage */ }
  return { ...DEFAULT_PREFERENCES }
}

export function savePreferences(prefs) {
  localStorage.setItem(PREFERENCE_STORAGE_KEY, JSON.stringify(prefs))
  window.dispatchEvent(new CustomEvent(PREFERENCE_CHANGE_EVENT, { detail: prefs }))
}

/** Preferred academic term in its display, API, and catalog-filter forms. */
export function getPreferredSemester() {
  return loadPreferences().academic.semester
}

export function toSemesterApiTerm(semester) {
  return String(semester || DEFAULT_PREFERENCES.academic.semester).replace(/\s+/g, '')
}

export function toSemesterSeason(semester) {
  return String(semester || DEFAULT_PREFERENCES.academic.semester).trim().split(/\s+/)[0]
}

// ── Pure helpers ───────────────────────────────────────────────────────────────

/** Returns up-to-2-char initials from a full name */
export function getInitials(fullName = '') {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return fullName.slice(0, 2).toUpperCase() || '?'
}

/** Returns role display config object */
export function getRoleConfig(role) {
  return ROLE_CONFIG[role] || { label: role, color: '#6B7280', bg: '#F3F4F6', icon: '👤' }
}

/** Returns academic standing config based on CGPA */
export function getStandingConfig(cgpa) {
  for (const s of STANDING_CONFIG) {
    if (cgpa >= s.min) return s
  }
  return STANDING_CONFIG[2]
}

/** Formats ISO date string → "Month DD, YYYY" */
export function formatJoinDate(isoStr) {
  if (!isoStr) return 'N/A'
  try {
    const d = new Date(isoStr)
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return isoStr
  }
}

/** Formats CGPA to 2 decimal places */
export function formatCgpa(cgpa) {
  if (cgpa == null) return 'N/A'
  return Number(cgpa).toFixed(2)
}

/**
 * Password strength scorer. Returns { score: 0-4, label, color }
 * 0 = very weak, 4 = strong
 */
export function scorePassword(pw = '') {
  let score = 0
  if (pw.length >= 8)  score++
  if (pw.length >= 12) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw))   score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  const capped = Math.min(score, 4)
  const levels = [
    { label: 'Very Weak', color: '#EF4444' },
    { label: 'Weak',      color: '#F97316' },
    { label: 'Fair',      color: '#F59E0B' },
    { label: 'Good',      color: '#10B981' },
    { label: 'Strong',    color: '#059669' },
  ]
  return { score: capped, ...levels[capped] }
}

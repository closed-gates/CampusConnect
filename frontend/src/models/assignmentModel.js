/**
 * assignmentModel.js – Model layer for the Assignment Submission feature.
 *
 * MVC Role: Model
 * Contains constants, status configurations, and pure helper functions.
 * No React, no hooks, no JSX, no styles.
 */

// ── Status constants ──────────────────────────────────────────
export const ASSIGNMENT_STATUS = {
  ASSIGNED:  'ASSIGNED',
  TURNED_IN: 'TURNED_IN',
  LATE:      'LATE',
  MISSING:   'MISSING',
  DRAFT:     'DRAFT',
}

// ── Status display configuration ──────────────────────────────
export const STATUS_CONFIG = {
  ASSIGNED:  { label: 'Assigned',  color: '#6B7280', bg: '#F3F4F6' },
  TURNED_IN: { label: 'Turned in', color: '#059669', bg: '#ECFDF5' },
  LATE:      { label: 'Late',      color: '#D97706', bg: '#FFFBEB' },
  MISSING:   { label: 'Missing',   color: '#DC2626', bg: '#FEF2F2' },
  DRAFT:     { label: 'Draft',     color: '#9CA3AF', bg: '#F9FAFB' },
}

// ── File constraints ──────────────────────────────────────────
export const MAX_FILE_SIZE = 10 * 1024 * 1024  // 10 MB

export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/zip',
  'application/x-rar-compressed',
  'application/java-archive',
  'text/x-java-source',
  'text/javascript',
  'text/x-python',
  'application/x-python-code',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
]

// ── File type icons ──────────────────────────────────────────
const FILE_ICON_MAP = {
  'application/pdf':            '📄',
  'application/msword':         '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.ms-excel':   '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'application/vnd.ms-powerpoint': '📽️',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📽️',
  'text/plain':                 '📃',
  'text/csv':                   '📊',
  'application/zip':            '🗜️',
  'application/x-rar-compressed': '🗜️',
  'image/png':                  '🖼️',
  'image/jpeg':                 '🖼️',
  'image/gif':                  '🖼️',
  'image/webp':                 '🖼️',
}

// ── Course icon/color map for assignment cards ────────────────
export const COURSE_COLORS = {
  CSE470: { bg: '#DBEAFE', accent: '#3B82F6', icon: '💻' },
  CSE321: { bg: '#FCE7F3', accent: '#EC4899', icon: '⚙️' },
  CSE220: { bg: '#D1FAE5', accent: '#10B981', icon: '🌲' },
  CSE110: { bg: '#FEF3C7', accent: '#F59E0B', icon: '🐍' },
  CSE370: { bg: '#E0E7FF', accent: '#6366F1', icon: '🗄️' },
  CSE421: { bg: '#FFE4E6', accent: '#F43F5E', icon: '📐' },
  CSE481: { bg: '#F3E8FF', accent: '#A855F7', icon: '🤖' },
  MAT201: { bg: '#ECFDF5', accent: '#059669', icon: '📏' },
  PHY101: { bg: '#F0F9FF', accent: '#0EA5E9', icon: '⚛️' },
  DEFAULT: { bg: '#F3F4F6', accent: '#6B7280', icon: '📚' },
}

// ── Empty form shapes ─────────────────────────────────────────
export const EMPTY_CREATE_FORM = {
  courseCode:   '',
  courseName:  '',
  title:       '',
  description: '',
  deadline:    '',
  createdBy:   '',
}

/** Map GET /api/courses/catalog rows into { code, name } options. */
export function toCourseOptions(catalog) {
  const rows = Array.isArray(catalog) ? catalog : []
  const seen = new Set()
  return rows
    .filter(course => {
      const code = course?.code
      if (!code || seen.has(code)) return false
      seen.add(code)
      return true
    })
    .map(course => ({ code: course.code, name: course.name || course.title || course.code }))
    .sort((a, b) => a.code.localeCompare(b.code))
}

// ── Pure helper functions ─────────────────────────────────────

/**
 * Returns deadline status with human-readable countdown.
 * @param {string} deadlineStr — ISO datetime string
 * @returns {{ label: string, urgent: boolean, overdue: boolean }}
 */
export function getDeadlineStatus(deadlineStr) {
  if (!deadlineStr) return { label: 'No deadline', urgent: false, overdue: false }

  const now      = new Date()
  const deadline = new Date(deadlineStr)
  const diff     = deadline - now
  const diffMins = Math.floor(diff / 60000)
  const diffHrs  = Math.floor(diff / 3600000)
  const diffDays = Math.floor(diff / 86400000)

  if (diff <= 0) {
    return { label: 'Deadline passed', urgent: false, overdue: true }
  }
  if (diffDays > 7) {
    return { label: `Due in ${diffDays} days`, urgent: false, overdue: false }
  }
  if (diffDays >= 2) {
    return { label: `Due in ${diffDays} days`, urgent: false, overdue: false }
  }
  if (diffDays >= 1) {
    return { label: `Due tomorrow`, urgent: true, overdue: false }
  }
  if (diffHrs >= 1) {
    return { label: `Due in ${diffHrs}h ${diffMins % 60}m`, urgent: true, overdue: false }
  }
  return { label: `Due in ${diffMins}m`, urgent: true, overdue: false }
}

/**
 * Formats a deadline ISO string to human-readable form.
 * @param {string} dateStr — ISO datetime string
 * @returns {string} e.g. "Aug 25, 2026, 11:59 PM"
 */
export function formatDeadline(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }) + ', ' + d.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

/**
 * Formats bytes to human-readable file size.
 * @param {number} bytes
 * @returns {string} e.g. "2.4 MB"
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i     = Math.floor(Math.log(bytes) / Math.log(1024))
  return (bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0) + ' ' + sizes[i]
}

/**
 * Returns an emoji icon for a given MIME type.
 * @param {string} mimeType
 * @returns {string}
 */
export function getFileIcon(mimeType) {
  return FILE_ICON_MAP[mimeType] || '📎'
}

/**
 * Returns the course colors/icon config for a given course code.
 * @param {string} code
 * @returns {{ bg: string, accent: string, icon: string }}
 */
export function getCourseConfig(code) {
  return COURSE_COLORS[code] || COURSE_COLORS.DEFAULT
}

/**
 * Derives the effective status for display given submission state and deadline.
 * @param {object|null} submission
 * @param {string} deadline — ISO datetime
 * @returns {string} — one of ASSIGNMENT_STATUS values
 */
export function deriveStatus(submission, deadline) {
  if (submission && submission.status === 'TURNED_IN') return ASSIGNMENT_STATUS.TURNED_IN
  if (submission && submission.status === 'DRAFT')     return ASSIGNMENT_STATUS.ASSIGNED

  const now = new Date()
  const dl  = new Date(deadline)
  if (dl < now) return ASSIGNMENT_STATUS.MISSING
  return ASSIGNMENT_STATUS.ASSIGNED
}

/**
 * Formats a datetime string to a shorter relative/absolute label.
 * @param {string} dateStr
 * @returns {string} e.g. "Jul 20" or "Jul 20, 2026"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** All query words must occur in the searchable fields, regardless of case. */
export function matchesAssignmentSearch(query, ...fields) {
  const text = fields.filter(Boolean).join(' ').toLowerCase()
  return query.trim().toLowerCase().split(/\s+/).every(word => text.includes(word))
}

/** Only passive formats are embedded; source and markup are rendered as plain text. */
export function submissionPreviewKind(name = '', type = '') {
  const extension = name.split('.').pop().toLowerCase()
  if (['docx', 'zip'].includes(extension)) return 'document'
  if (extension === 'pdf' || type === 'application/pdf') return 'pdf'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(extension)) return 'image'
  if (type.startsWith('text/') || ['txt', 'md', 'csv', 'json', 'xml', 'html', 'svg', 'py', 'java', 'c', 'cpp', 'h', 'js', 'ts', 'css', 'sql', 'ipynb'].includes(extension)) return 'text'
  return 'unsupported'
}

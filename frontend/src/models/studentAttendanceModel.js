/**
 * studentAttendanceModel.js – Model layer for Student Attendance view.
 *
 * MVC Role: Model
 * Pure JS — no JSX, no hooks, no side effects.
 *
 * Defines constants, helper functions, and initial state shapes used by
 * useStudentAttendanceController and StudentAttendancePanel.
 */

/** Status color config for attendance badges */
export const STATUS_CONFIG = {
  PRESENT: { label: 'Present', color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  icon: '✅' },
  ABSENT:  { label: 'Absent',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: '❌' },
  LATE:    { label: 'Late',    color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: '⏰' },
}

/**
 * Colour-coded ring based on attendance percentage.
 *   ≥ 75%  → green (safe)
 *   60–74% → amber (warning)
 *   < 60%  → red   (danger)
 */
export function getRateColor(rate) {
  if (rate >= 75) return '#22c55e'
  if (rate >= 60) return '#f59e0b'
  return '#ef4444'
}

/**
 * Returns a progress-bar gradient colour string based on rate.
 */
export function getRateGradient(rate) {
  if (rate >= 75) return 'linear-gradient(90deg, #22c55e, #16a34a)'
  if (rate >= 60) return 'linear-gradient(90deg, #f59e0b, #d97706)'
  return 'linear-gradient(90deg, #ef4444, #dc2626)'
}

/**
 * Human-readable status label for the overall attendance message.
 */
export function getAttendanceStatus(rate) {
  if (rate >= 80) return { label: 'Excellent',     color: '#22c55e' }
  if (rate >= 75) return { label: 'Good',          color: '#22c55e' }
  if (rate >= 60) return { label: 'Warning',       color: '#f59e0b' }
  return              { label: 'Critical – Risk', color: '#ef4444' }
}

/** Empty state for a course attendance entry */
export const EMPTY_COURSE_ATTENDANCE = {
  courseId:       '',
  courseName:     '',
  section:        '',
  faculty:        '',
  totalSessions:  0,
  presentCount:   0,
  lateCount:      0,
  absentCount:    0,
  attendanceRate: 0,
}

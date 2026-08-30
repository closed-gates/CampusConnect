/**
 * attendanceModel.js – Model layer for the Attendance Tracking feature.
 *
 * MVC Role: Model
 * Contains ONLY pure helper functions, constants, and initial state shapes.
 * All dynamic data (courses, students, records) is now fetched from the
 * backend API by the controller — no static seed lists here.
 *
 * API endpoints consumed by the controller:
 *   GET /api/attendance/faculty-courses?markedBy=X     → faculty's courses
 *   GET /api/attendance/enrolled-students?courseId=X   → students in a course
 *   GET /api/attendance?courseId=X&date=Y              → attendance for a date
 *   GET /api/attendance/history?courseId=X             → full history
 *   GET /api/attendance/summary?courseId=X             → summary stats
 *   POST /api/attendance                               → mark / update attendance
 *   GET /api/attendance/student/{studentId}            → student personal report
 */

// ── Course display helpers (UI-only, not business data) ──────────────────────

/**
 * Colour palette for course cards.
 * Maps courseId → CSS colour token. New/unknown courses fall back to indigo.
 */
export const COURSE_COLORS = {
  CSE470: '#0D9488',
  CSE341: '#7C3AED',
  CSE221: '#D97706',
  CSE311: '#E11D48',
  CSE332: '#2563EB',
  CSE422: '#059669',
}

/**
 * Returns the display color for a given courseId.
 * Falls back to a neutral indigo for courses not in the map.
 *
 * @param {string} courseId
 * @returns {string} CSS colour value
 */
export function getCourseColor(courseId) {
  return COURSE_COLORS[courseId] || '#6366F1'
}

// ── Date helpers ──────────────────────────────────────────────────────────────

/** Get today's ISO date string (YYYY-MM-DD). */
export function getToday() {
  return new Date().toISOString().split('T')[0]
}

/** Format an ISO date string into a human-readable label. */
export function formatAttendanceDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  })
}

// ── Status configuration ──────────────────────────────────────────────────────

/** Visual config for each attendance status value. */
export const STATUS_CONFIG = {
  PRESENT: { label: 'Present', color: '#10B981', bg: '#ECFDF5', icon: '✓' },
  ABSENT:  { label: 'Absent',  color: '#EF4444', bg: '#FEF2F2', icon: '✕' },
  LATE:    { label: 'Late',    color: '#F59E0B', bg: '#FFFBEB', icon: '⏱' },
}

// ── Initial state shapes ──────────────────────────────────────────────────────

/** Empty summary shape — used as initial state before API data arrives. */
export const EMPTY_SUMMARY = { total: 0, present: 0, absent: 0, late: 0, rate: 0 }

// ── Pure computation helpers ──────────────────────────────────────────────────

/**
 * Calculate summary stats from an attendance records array.
 * @param {Array} records - Array of { status: 'PRESENT'|'ABSENT'|'LATE' }
 * @returns {{ total, present, absent, late, rate }}
 */
export function calculateSummary(records) {
  const total   = records.length
  const present = records.filter(r => r.status === 'PRESENT').length
  const absent  = records.filter(r => r.status === 'ABSENT').length
  const late    = records.filter(r => r.status === 'LATE').length
  const rate    = total > 0 ? Math.round(((present + late) / total) * 1000) / 10 : 0
  return { total, present, absent, late, rate }
}

/**
 * Group attendance records by date.
 * @param {Array} records
 * @returns {Object} { 'YYYY-MM-DD': [...records] }
 */
export function groupByDate(records) {
  return records.reduce((acc, r) => {
    if (!acc[r.date]) acc[r.date] = []
    acc[r.date].push(r)
    return acc
  }, {})
}

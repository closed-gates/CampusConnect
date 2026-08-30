/**
 * attendanceModel.js – Model layer for the Faculty Attendance Tracking page.
 *
 * MVC Role: Model
 * Contains seed data for courses, enrolled students, and attendance records.
 * Also contains helper functions for attendance calculations.
 *
 * TODO (Phase 2): Replace seed data with API calls:
 *   GET /api/attendance?courseId=X&date=Y  → attendance records
 *   GET /api/attendance/summary?courseId=X → summary stats
 */

/** Courses the faculty teaches (seed data) */
export const FACULTY_COURSES = [
  {
    id: 'CSE470',
    name: 'Software Engineering',
    section: 'Section 01',
    schedule: 'Sun, Tue — 9:30 AM',
    totalStudents: 5,
    color: '#0D9488',
  },
  {
    id: 'CSE341',
    name: 'Microprocessors',
    section: 'Section 02',
    schedule: 'Mon, Wed — 11:00 AM',
    totalStudents: 4,
    color: '#7C3AED',
  },
  {
    id: 'CSE221',
    name: 'Data Structures',
    section: 'Section 01',
    schedule: 'Tue, Thu — 2:00 PM',
    totalStudents: 6,
    color: '#D97706',
  },
]

/** Enrolled students per course (seed data) */
export const COURSE_STUDENTS = {
  CSE470: [
    { id: '21201001', name: 'Arham Khan' },
    { id: '21201002', name: 'Sarah Ahmed' },
    { id: '21201003', name: 'David Kim' },
    { id: '21201004', name: 'Emily Chen' },
    { id: '21201005', name: 'Michael Ross' },
  ],
  CSE341: [
    { id: '21201001', name: 'Arham Khan' },
    { id: '21201006', name: 'Jessica Park' },
    { id: '21201007', name: 'James Wilson' },
    { id: '21201008', name: 'Lily Zhang' },
  ],
  CSE221: [
    { id: '21201001', name: 'Arham Khan' },
    { id: '21201002', name: 'Sarah Ahmed' },
    { id: '21201006', name: 'Jessica Park' },
    { id: '21201009', name: 'Omar Faruk' },
    { id: '21201010', name: 'Nadia Rahman' },
    { id: '21201011', name: 'Chris Lee' },
  ],
}

/** Seed attendance history (past records for demo) */
export const SEED_ATTENDANCE_HISTORY = [
  // CSE470 — yesterday
  { id: 1,  courseId: 'CSE470', studentId: '21201001', studentName: 'Arham Khan',   date: getPastDate(1), status: 'PRESENT' },
  { id: 2,  courseId: 'CSE470', studentId: '21201002', studentName: 'Sarah Ahmed',  date: getPastDate(1), status: 'PRESENT' },
  { id: 3,  courseId: 'CSE470', studentId: '21201003', studentName: 'David Kim',    date: getPastDate(1), status: 'ABSENT' },
  { id: 4,  courseId: 'CSE470', studentId: '21201004', studentName: 'Emily Chen',   date: getPastDate(1), status: 'PRESENT' },
  { id: 5,  courseId: 'CSE470', studentId: '21201005', studentName: 'Michael Ross', date: getPastDate(1), status: 'LATE' },
  // CSE470 — 2 days ago
  { id: 6,  courseId: 'CSE470', studentId: '21201001', studentName: 'Arham Khan',   date: getPastDate(2), status: 'PRESENT' },
  { id: 7,  courseId: 'CSE470', studentId: '21201002', studentName: 'Sarah Ahmed',  date: getPastDate(2), status: 'LATE' },
  { id: 8,  courseId: 'CSE470', studentId: '21201003', studentName: 'David Kim',    date: getPastDate(2), status: 'PRESENT' },
  { id: 9,  courseId: 'CSE470', studentId: '21201004', studentName: 'Emily Chen',   date: getPastDate(2), status: 'PRESENT' },
  { id: 10, courseId: 'CSE470', studentId: '21201005', studentName: 'Michael Ross', date: getPastDate(2), status: 'PRESENT' },
  // CSE470 — 4 days ago
  { id: 11, courseId: 'CSE470', studentId: '21201001', studentName: 'Arham Khan',   date: getPastDate(4), status: 'PRESENT' },
  { id: 12, courseId: 'CSE470', studentId: '21201002', studentName: 'Sarah Ahmed',  date: getPastDate(4), status: 'PRESENT' },
  { id: 13, courseId: 'CSE470', studentId: '21201003', studentName: 'David Kim',    date: getPastDate(4), status: 'PRESENT' },
  { id: 14, courseId: 'CSE470', studentId: '21201004', studentName: 'Emily Chen',   date: getPastDate(4), status: 'ABSENT' },
  { id: 15, courseId: 'CSE470', studentId: '21201005', studentName: 'Michael Ross', date: getPastDate(4), status: 'PRESENT' },
  // CSE341 — yesterday
  { id: 16, courseId: 'CSE341', studentId: '21201001', studentName: 'Arham Khan',   date: getPastDate(1), status: 'PRESENT' },
  { id: 17, courseId: 'CSE341', studentId: '21201006', studentName: 'Jessica Park', date: getPastDate(1), status: 'PRESENT' },
  { id: 18, courseId: 'CSE341', studentId: '21201007', studentName: 'James Wilson', date: getPastDate(1), status: 'ABSENT' },
  { id: 19, courseId: 'CSE341', studentId: '21201008', studentName: 'Lily Zhang',   date: getPastDate(1), status: 'PRESENT' },
  // CSE341 — 3 days ago
  { id: 20, courseId: 'CSE341', studentId: '21201001', studentName: 'Arham Khan',   date: getPastDate(3), status: 'LATE' },
  { id: 21, courseId: 'CSE341', studentId: '21201006', studentName: 'Jessica Park', date: getPastDate(3), status: 'PRESENT' },
  { id: 22, courseId: 'CSE341', studentId: '21201007', studentName: 'James Wilson', date: getPastDate(3), status: 'PRESENT' },
  { id: 23, courseId: 'CSE341', studentId: '21201008', studentName: 'Lily Zhang',   date: getPastDate(3), status: 'PRESENT' },
]

/** Helper: get ISO date string for N days ago */
function getPastDate(daysAgo) {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString().split('T')[0]
}

/** Get today's ISO date string */
export function getToday() {
  return new Date().toISOString().split('T')[0]
}

/** Format ISO date to readable string */
export function formatAttendanceDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  })
}

/** Attendance status config: label, color, icon */
export const STATUS_CONFIG = {
  PRESENT: { label: 'Present', color: '#10B981', bg: '#ECFDF5', icon: '✓' },
  ABSENT:  { label: 'Absent',  color: '#EF4444', bg: '#FEF2F2', icon: '✕' },
  LATE:    { label: 'Late',    color: '#F59E0B', bg: '#FFFBEB', icon: '⏱' },
}

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

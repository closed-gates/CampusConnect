/**
 * courseService.js – API service for BRACU course catalog and sections.
 *
 * MVC Role: Service (API layer)
 *
 * Wraps all fetch() calls to the backend CourseController.
 * Used by: coursesController.js, routineController.js
 *
 * Endpoints:
 *   GET  /api/courses/catalog               → getCatalog()
 *   GET  /api/courses/sections?q=           → getSections(q)
 *   POST /api/courses/enroll                → enroll(studentId, courseId)
 *   GET  /api/courses/enrolled?studentId=   → getEnrolledIds(studentId)
 *   GET  /api/exam-schedule/all             → getExamSchedules()
 */

const API_BASE      = '/api/courses'
const EXAM_API_BASE = '/api/exam-schedule'

/**
 * Fetch all catalog courses from the Neon database.
 * Client-side filtering is applied by the controller after fetch.
 * @returns {Promise<Array>} Array of CourseCatalog objects
 */
export async function getCatalog() {
  const res = await fetch(`${API_BASE}/catalog`)
  if (!res.ok) throw new Error(`Failed to load course catalog: ${res.status}`)
  return res.json()
}

/**
 * Fetch all course sections for the Routine Builder.
 * @param {string} q - Optional search query (code, title, section number)
 * @returns {Promise<Array>} Array of CourseSection objects
 */
export async function getSections(q = '') {
  const url = q.trim()
    ? `${API_BASE}/sections?q=${encodeURIComponent(q)}`
    : `${API_BASE}/sections`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to load course sections: ${res.status}`)
  return res.json()
}

/**
 * Fetch exam schedules for ALL courses from the exam_schedules table.
 * Used by the Routine Builder to display live midterm/final exam dates.
 * @returns {Promise<Array>} Array of ExamScheduleDTO objects
 */
export async function getExamSchedules() {
  const res = await fetch(`${EXAM_API_BASE}/all`)
  if (!res.ok) throw new Error(`Failed to load exam schedules: ${res.status}`)
  return res.json()
}

/**
 * Fetch the full course catalog and transform each entry into a shape
 * compatible with the Routine Builder (adds virtual section/time fields
 * for courses that don't have CourseSection rows in the DB).
 *
 * Catalog fields:  { code, name, facultyId, credits, instructor, enrolled, capacity, ... }
 * Routine shape:   { id, code, section, title, faculty, time, room, examDay, totalSeats, booked }
 *
 * Used by: routineController.js to show ALL catalog courses on the Routine page.
 * @returns {Promise<Array>}
 */
export async function getCatalogForRoutine() {
  const res = await fetch(`${API_BASE}/catalog`)
  if (!res.ok) throw new Error(`Failed to load catalog for routine: ${res.status}`)
  const data = await res.json()
  return data.map(c => ({
    // Use code as unique ID for catalog-only courses (no DB section row)
    id:         `${c.code}-CAT`,
    code:       c.code,
    section:    '—',
    title:      c.name,
    faculty:    c.instructor,
    // Catalog courses have no time/room — shown as TBA
    time:       'TBA',
    room:       'TBA',
    examDay:    null,            // will be filled by exam schedule merge
    midtermDay: null,
    totalSeats: c.capacity  || 0,
    booked:     c.enrolled  || 0,
    credits:    c.credits   || 3,
    tags:       typeof c.tags === 'string'
                  ? c.tags.split(',').map(t => t.trim()).filter(Boolean)
                  : (c.tags || []),
    description: c.description || '',
  }))
}

export const courseService = { getCatalog, getSections, getExamSchedules, getCatalogForRoutine }

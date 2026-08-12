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
 */

const API_BASE = 'http://localhost:8080/api/courses'

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
 * Enroll a student in a catalog course (persisted to Neon DB).
 * @param {string} studentId
 * @param {number} courseId - The DB primary key of the CourseCatalog row
 * @returns {Promise<{message: string, courseCode: string}>}
 */
export async function enroll(studentId, courseId) {
  const res = await fetch(`${API_BASE}/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, courseId }),
  })
  if (res.status === 409) throw new Error('Already enrolled in this course.')
  if (!res.ok) throw new Error(`Enrollment failed: ${res.status}`)
  return res.json()
}

/**
 * Get the list of course IDs a student is enrolled in (from Neon DB).
 * Used to hydrate the localStorage cache on page load.
 * @param {string} studentId
 * @returns {Promise<number[]>} Array of course ID numbers
 */
export async function getEnrolledIds(studentId) {
  const res = await fetch(`${API_BASE}/enrolled?studentId=${encodeURIComponent(studentId)}`)
  if (!res.ok) throw new Error(`Failed to load enrolled courses: ${res.status}`)
  return res.json()
}

export const courseService = { getCatalog, getSections, enroll, getEnrolledIds }

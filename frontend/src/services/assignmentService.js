/**
 * assignmentService.js – API service for Assignment Submission feature.
 *
 * MVC Role: Service (API layer)
 *
 * Wraps all fetch() calls to the backend AssignmentController.
 * Used by: assignmentController.js
 *
 * Endpoints:
 *   GET    /api/assignments                          → getAssignments()
 *   GET    /api/assignments/{id}                     → getAssignment(id)
 *   POST   /api/assignments                          → createAssignment(formData)
 *   POST   /api/assignments/{id}/submit              → submitWork(id, formData)
 *   DELETE /api/assignments/{id}/submit?studentId=   → unsubmitWork(id, studentId)
 *   GET    /api/assignments/{id}/submission?studentId= → getSubmission(id, studentId)
 *   GET    /api/assignments/{id}/submissions          → getSubmissions(id)
 */

const API_BASE = 'http://localhost:8080/api/assignments'

/**
 * Fetch all assignments (summary, no binary data).
 * @returns {Promise<Array>}
 */
export async function getAssignments() {
  const res = await fetch(API_BASE)
  if (!res.ok) throw new Error(`Failed to load assignments: ${res.status}`)
  const json = await res.json()
  return json.data || []
}

/**
 * Fetch a single assignment with full details.
 * @param {number} id
 * @returns {Promise<Object>}
 */
export async function getAssignment(id) {
  const res = await fetch(`${API_BASE}/${id}`)
  if (!res.ok) throw new Error(`Failed to load assignment: ${res.status}`)
  const json = await res.json()
  return json.data
}

/**
 * Teacher creates a new assignment (multipart form data).
 * @param {FormData} formData — includes courseCode, courseName, title, description, totalPoints, deadline, createdBy, file
 * @returns {Promise<Object>}
 */
export async function createAssignment(formData) {
  const res = await fetch(API_BASE, {
    method: 'POST',
    body:   formData,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || `Failed to create assignment: ${res.status}`)
  return json.data
}

/**
 * Student turns in their work (multipart form data).
 * @param {number} assignmentId
 * @param {FormData} formData — includes studentId, studentName, file
 * @returns {Promise<Object>}
 */
export async function submitWork(assignmentId, formData) {
  const res = await fetch(`${API_BASE}/${assignmentId}/submit`, {
    method: 'POST',
    body:   formData,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || `Failed to submit work: ${res.status}`)
  return json.data
}

/**
 * Student unsubmits their work.
 * @param {number} assignmentId
 * @param {string} studentId
 * @returns {Promise<void>}
 */
export async function unsubmitWork(assignmentId, studentId) {
  const res = await fetch(
    `${API_BASE}/${assignmentId}/submit?studentId=${encodeURIComponent(studentId)}`,
    { method: 'DELETE' }
  )
  const json = await res.json()
  if (!res.ok) throw new Error(json.message || `Failed to unsubmit: ${res.status}`)
}

/**
 * Get a student's submission for a specific assignment.
 * @param {number} assignmentId
 * @param {string} studentId
 * @returns {Promise<Object|null>}
 */
export async function getSubmission(assignmentId, studentId) {
  const res = await fetch(
    `${API_BASE}/${assignmentId}/submission?studentId=${encodeURIComponent(studentId)}`
  )
  if (!res.ok) throw new Error(`Failed to load submission: ${res.status}`)
  const json = await res.json()
  return json.data || null
}

/**
 * Teacher: Get all submissions for an assignment.
 * @param {number} assignmentId
 * @returns {Promise<Array>}
 */
export async function getSubmissions(assignmentId) {
  const res = await fetch(`${API_BASE}/${assignmentId}/submissions`)
  if (!res.ok) throw new Error(`Failed to load submissions: ${res.status}`)
  const json = await res.json()
  return json.data || []
}



/**
 * Returns the download URL for a teacher's question file attachment.
 * @param {number} assignmentId
 * @returns {string}
 */
export function getAttachmentUrl(assignmentId) {
  return `${API_BASE}/${assignmentId}/attachment`
}

/**
 * Returns the download URL for a student's submitted file.
 * @param {number} submissionId
 * @returns {string}
 */
export function getSubmissionFileUrl(submissionId) {
  return `${API_BASE}/submissions/${submissionId}/file`
}

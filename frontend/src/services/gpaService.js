/**
 * gpaService.js – API service for student Grade Tracking and GPA Calculation.
 *
 * MVC Role: Service (API layer)
 *
 * All calls go through apiClient so the JWT Bearer token is automatically attached.
 * All paths use the standard /api/student/gpa base.
 */

import apiClient from './apiClient.js'

const API_BASE = '/api/student/gpa'

export const gpaService = {
  /**
   * Fetch the authenticated student's full grade transcript.
   * GET /api/student/gpa/transcript
   *
   * @returns {Promise<Object>} { success, studentId, studentName, currentCgpa,
   *                              completedCredits, semesters, totalSemesters }
   */
  async getTranscript() {
    const res = await apiClient.get(`${API_BASE}/transcript`)
    if (!res.ok) throw new Error(`Failed to load transcript (${res.status})`)
    return res.json()
  },

  /**
   * Fetch the student's current in-progress (advised) courses for the predict tab.
   * GET /api/student/gpa/current-courses
   *
   * @returns {Promise<Object>} { success, courses: [{courseCode, courseName, credits, section, faculty}] }
   */
  async getCurrentCourses() {
    const res = await apiClient.get(`${API_BASE}/current-courses`)
    if (!res.ok) throw new Error(`Failed to load current courses (${res.status})`)
    return res.json()
  },

  /**
   * Submit a list of predicted grades and receive a CGPA simulation.
   * POST /api/student/gpa/predict
   *
   * @param {{ courses: Array<{courseCode, courseName, credits, predictedGrade}> }} payload
   * @returns {Promise<Object>} { success, existingCgpa, predictedSemGpa, predictedCgpa,
   *                              totalPredictedCredits, breakdown, simulated }
   */
  async predictCgpa(payload) {
    const res = await apiClient.post(`${API_BASE}/predict`, payload)
    return res.json()
  },

  /**
   * Simulate a course retake with a hypothetical new grade.
   * POST /api/student/gpa/simulate-retake
   *
   * @param {{ courseCode: string, newGrade: string }} payload
   * @returns {Promise<Object>} { success, beforeCgpa, afterCgpa, cgpaChange,
   *                              oldGrade, newGrade, credits, simulated, retakePolicy }
   */
  async simulateRetake(payload) {
    const res = await apiClient.post(`${API_BASE}/simulate-retake`, payload)
    return res.json()
  },
}

/**
 * testCourseService.js – API client service for Test Courses, Sections, and Faculty.
 *
 * MVC Role: Service (API layer)
 */

import apiClient from './apiClient.js'

const API_BASE = '/api/test-courses'

export const testCourseService = {
  /**
   * Fetches all 22 test courses from the database.
   * @returns {Promise<Array>}
   */
  async getCourses() {
    const res = await apiClient.get(API_BASE)
    if (!res.ok) throw new Error(`Failed to fetch test courses: ${res.status}`)
    return res.json()
  },

  /**
   * Fetches all 12 test faculty members from the database.
   * @returns {Promise<Array>}
   */
  async getFaculty() {
    const res = await apiClient.get(`${API_BASE}/faculty`)
    if (!res.ok) throw new Error(`Failed to fetch test faculty: ${res.status}`)
    return res.json()
  },

  /**
   * Fetches all 74 test sections with course and faculty associations.
   * @param {Object} [params]
   * @param {string} [params.courseCode]
   * @param {string} [params.facultyId]
   * @returns {Promise<Array>}
   */
  async getSections({ courseCode = '', facultyId = '' } = {}) {
    const query = new URLSearchParams()
    if (courseCode) query.set('courseCode', courseCode)
    if (facultyId) query.set('facultyId', facultyId)
    const qs = query.toString() ? `?${query.toString()}` : ''

    const res = await apiClient.get(`${API_BASE}/sections${qs}`)
    if (!res.ok) throw new Error(`Failed to fetch test sections: ${res.status}`)
    return res.json()
  }
}

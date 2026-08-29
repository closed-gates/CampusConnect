/**
 * bypassCourseService.js – API service for Admin Course Bypass & CGPA tracking.
 *
 * MVC Role: Service (API layer)
 */

import apiClient from './apiClient.js'

const API_BASE = '/api/admin/bypass-course'

export const bypassCourseService = {
  /**
   * Fetch all students with active academic statistics.
   */
  async getStudents() {
    const res = await apiClient.get(`${API_BASE}/students`)
    if (!res.ok) throw new Error('Failed to load students')
    return res.json()
  },

  /**
   * Fetch full completed/bypassed courses history for a student.
   */
  async getStudentHistory(studentId) {
    const res = await apiClient.get(`${API_BASE}/student/${studentId}`)
    if (!res.ok) throw new Error('Failed to load student bypass history')
    return res.json()
  },

  /**
   * Submit a course bypass for a student.
   */
  async bypassCourse(payload) {
    const res = await apiClient.post(API_BASE, payload)
    return res.json()
  },

  /**
   * Delete / revert a bypassed course record.
   */
  async deleteBypassRecord(studentId, recordId) {
    const res = await apiClient.delete(`${API_BASE}/${studentId}/${recordId}`)
    return res.json()
  }
}

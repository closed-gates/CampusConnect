/**
 * dashboardService.js – API service for Dashboard data.
 *
 * MVC Role: Service (API layer)
 *
 * Provides functions to fetch:
 *   1. Student registered course sections from /api/registration/my or /api/advisors/student
 *   2. Student attendance metrics & session history from /api/attendance/student
 *
 * All requests go through apiClient which auto-attaches the JWT Bearer token.
 */

import apiClient from './apiClient.js'

const REGISTRATION_API_BASE = '/api/registration'
const ADVISOR_API_BASE      = '/api/advisors'
const ATTENDANCE_API_BASE   = '/api/attendance'

/**
 * Fetches the registered/advised course sections for a student.
 * Primary: /api/registration/my
 * Fallback: /api/advisors/student/{id}
 *
 * @param {string} studentId
 * @returns {Promise<Array>} Array of registered course section objects
 */
export async function getStudentRegisteredCourses(studentId = 'STU001') {
  try {
    const res = await apiClient.get(`${REGISTRATION_API_BASE}/my?studentId=${encodeURIComponent(studentId)}`)
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        return data
      }
    }
  } catch (err) {
    console.warn('[dashboardService] Failed to load from registration endpoint, trying advisor profile:', err)
  }

  // Fallback to advisor assigned courses
  try {
    const advRes = await apiClient.get(`${ADVISOR_API_BASE}/student/${encodeURIComponent(studentId)}`)
    if (advRes.ok) {
      const profile = await advRes.json()
      if (profile && Array.isArray(profile.advisedCourses)) {
        return profile.advisedCourses.map(ac => ({
          id:      ac.id || `${ac.courseCode}-${ac.section}`,
          code:    ac.courseCode,
          section: ac.section,
          title:   ac.courseTitle,
          faculty: ac.faculty,
          time:    ac.time,
          room:    ac.room,
          credits: ac.credits || 3,
        }))
      }
    }
  } catch (err) {
    console.error('[dashboardService] Failed to fetch student profile courses:', err)
  }

  return []
}

/**
 * Fetches the student's attendance summary & session history from the database.
 *
 * @param {string} studentId
 * @returns {Promise<Object>}
 */
export async function getStudentAttendanceSummary(studentId = 'STU001', term = '') {
  try {
    const res = await apiClient.get(`${ATTENDANCE_API_BASE}/student-courses?studentId=${encodeURIComponent(studentId)}&term=${encodeURIComponent(term)}`)
    if (!res.ok) throw new Error(`Attendance API returned ${res.status}`)
    const json = await res.json()
    const courseBreakdown = json.data || []
    const totalSessions = courseBreakdown.reduce((sum, course) => sum + (course.totalSessions || 0), 0)
    const presentCount = courseBreakdown.reduce((sum, course) => sum + (course.presentCount || 0), 0)
    const lateCount = courseBreakdown.reduce((sum, course) => sum + (course.lateCount || 0), 0)
    const absentCount = courseBreakdown.reduce((sum, course) => sum + (course.absentCount || 0), 0)
    return { totalSessions, presentCount, lateCount, absentCount, attendanceRate: totalSessions ? Math.round((presentCount + lateCount) / totalSessions * 1000) / 10 : 0, courseBreakdown, history: [] }
  } catch (err) {
    console.error('[dashboardService] Failed to fetch student attendance:', err)
    return null
  }
}

export const dashboardService = {
  getStudentRegisteredCourses,
  getStudentAttendanceSummary,
}

/**
 * studentAttendanceController.js – Controller for Student Attendance panel.
 *
 * MVC Role: Controller (custom React hook)
 * No JSX, no CSS. Returns state and callbacks to the View layer only.
 *
 * Data flow:
 *   1. Reads the logged-in student's ID from the JWT via getStoredUser()
 *   2. Calls GET /api/attendance/student-courses?studentId=X
 *      → backend merges SectionRegistration + AttendanceRecord tables
 *      → returns each registered course with its attendance stats
 *   3. Also fetches the overall student report from
 *      GET /api/attendance/student/{studentId} for the summary numbers
 *
 * Sync with Registration:
 *   When a student adds a course in the Advising/Registration feature,
 *   that course is stored in section_registrations. The backend's
 *   getStudentCourses() reads that table, so the course appears here
 *   immediately — no manual sync needed.
 */

import { useState, useEffect, useCallback } from 'react'
import { getStoredUser } from '../models/authModel.js'
import apiClient from '../services/apiClient.js'
import { EMPTY_COURSE_ATTENDANCE } from '../models/studentAttendanceModel.js'

const API_BASE = '/api/attendance'
const TERM     = 'Fall2026'   // current term; update when changing semester

/**
 * useStudentAttendanceController
 *
 * Returns:
 *   courses         – Array of course objects with attendance stats
 *   overallRate     – Weighted overall attendance % across all courses
 *   loading         – true while fetching
 *   error           – error string or null
 *   selectedCourse  – currently selected course for detail view (or null)
 *   selectCourse    – (course) => void, sets the selected course
 *   refresh         – () => void, manually triggers a re-fetch
 *   studentId       – resolved student ID
 */
export function useStudentAttendanceController() {
  const user      = getStoredUser()
  const studentId = user?.userId || 'STU001'

  const [courses,        setCourses]        = useState([])
  const [overallRate,    setOverallRate]    = useState(0)
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Primary: registered courses with per-course attendance stats
      const coursesRes = await apiClient.get(
        `${API_BASE}/student-courses?studentId=${encodeURIComponent(studentId)}&term=${TERM}`
      )

      if (!coursesRes.ok) throw new Error(`API returned ${coursesRes.status}`)
      const coursesJson = await coursesRes.json()
      const rawCourses  = coursesJson.data || []

      setCourses(rawCourses)

      // Compute weighted overall attendance rate
      const totalSessions = rawCourses.reduce((s, c) => s + (c.totalSessions || 0), 0)
      if (totalSessions > 0) {
        const totalPresent = rawCourses.reduce((s, c) => s + (c.presentCount || 0) + (c.lateCount || 0), 0)
        setOverallRate(Math.round(totalPresent / totalSessions * 1000) / 10)
      } else {
        // Fall back to overall report rate when no sessions recorded yet
        const reportRes = await apiClient.get(
          `${API_BASE}/student/${encodeURIComponent(studentId)}`
        )
        if (reportRes.ok) {
          const reportJson = await reportRes.json()
          setOverallRate(reportJson.data?.attendanceRate || 0)
        }
      }
    } catch (err) {
      console.error('[StudentAttendanceController] Failed to load attendance:', err)
      setError('Could not load your attendance data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [studentId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    courses,
    overallRate,
    loading,
    error,
    selectedCourse,
    selectCourse:  setSelectedCourse,
    refresh:       fetchData,
    studentId,
  }
}

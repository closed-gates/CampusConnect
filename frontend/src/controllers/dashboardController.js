/**
 * dashboardController.js – Controller layer for the Dashboard page.
 *
 * MVC Role: Controller
 *
 * Provides live state and computed values for DashboardView from the database:
 *   1. Enrolled courses count (from registration/advising tables)
 *   2. Weekly classes count (computed from registered course routine time slots)
 *   3. Attendance metrics percentage & session logs (from attendance_records table)
 *   4. Interactive modal triggers for "View details", "View schedule", and "View report".
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  calculateWeeklyClassCount,
  buildRoutineGrid,
} from '../models/dashboardModel.js'
import { dashboardService } from '../services/dashboardService.js'
import { getStoredUser } from '../models/authModel.js'
import { loadPreferences, PREFERENCE_CHANGE_EVENT } from '../models/accountSettingsModel.js'
import { getPreferredSemester, toSemesterApiTerm } from '../models/accountSettingsModel.js'

/**
 * useDashboardController
 * Custom React hook powering DashboardView.
 * Resolves the authenticated student's ID from localStorage (cc_userId).
 * Falls back to 'STU001' only for unauthenticated / demo sessions.
 */
export function useDashboardController() {
  const storedUser = getStoredUser()
  const studentId  = storedUser?.userId || 'STU001'
  const fullName   = storedUser?.fullName || 'Student'
  const isStudent  = !storedUser?.role || storedUser.role === 'STUDENT'
  const attendanceTerm = toSemesterApiTerm(getPreferredSemester())
  const [courses,          setCourses]          = useState([])
  const [attendanceReport, setAttendanceReport] = useState(null)
  const [loading,          setLoading]          = useState(true)
  const [error,            setError]            = useState(null)
  const [activeModal,      setActiveModal]      = useState(null) // 'details' | 'routine' | 'attendance' | null
  const [showUpcomingExams, setShowUpcomingExams] = useState(
    () => loadPreferences().academic.dashboardExams
  )

  // Keep the widget preference reactive without changing exam retrieval or
  // any of the dashboard's academic data flows.
  useEffect(() => {
    const syncPreference = event => {
      const preferences = event?.detail || loadPreferences()
      setShowUpcomingExams(preferences.academic.dashboardExams)
    }
    window.addEventListener(PREFERENCE_CHANGE_EVENT, syncPreference)
    window.addEventListener('storage', syncPreference)
    return () => {
      window.removeEventListener(PREFERENCE_CHANGE_EVENT, syncPreference)
      window.removeEventListener('storage', syncPreference)
    }
  }, [])

  // Date formatting
  const today = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
  }, [])

  // Load live data from database on mount
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      dashboardService.getStudentRegisteredCourses(studentId),
      isStudent ? dashboardService.getStudentAttendanceSummary(studentId, attendanceTerm) : Promise.resolve(null),
    ])
      .then(([coursesData, attendanceData]) => {
        if (!cancelled) {
          setCourses(coursesData || [])
          setAttendanceReport(attendanceData || null)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('[dashboardController] Error loading dashboard data:', err)
          setError('Failed to load dashboard metrics.')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [studentId, isStudent, attendanceTerm])

  // Computed metrics
  const enrolledCount     = courses.length
  const weeklyClassCount  = useMemo(() => calculateWeeklyClassCount(courses), [courses])
  const routineGrid       = useMemo(() => buildRoutineGrid(courses), [courses])

  // Show the LOWEST per-course attendance rate on the stat card so the
  // student immediately sees which course needs attention.
  // Shows '—' when no classes have been conducted yet (totalSessions === 0).
  const { lowestRate, lowestCourseName } = useMemo(() => {
    // No classes conducted yet → do not show a phantom percentage
    if (!attendanceReport || attendanceReport.totalSessions === 0) {
      return { lowestRate: null, lowestCourseName: null }
    }
    const breakdown = attendanceReport.courseBreakdown
    // Only consider courses that have actually had sessions recorded
    const activeCourses = (breakdown || []).filter(c => (c.totalSessions ?? 0) > 0)
    if (activeCourses.length === 0) {
      // Classes conducted overall but no per-course breakdown yet → use overall rate
      return {
        lowestRate:       attendanceReport.attendanceRate ?? null,
        lowestCourseName: null,
      }
    }
    const worst = activeCourses.reduce((min, c) =>
      c.attendanceRate < min.attendanceRate ? c : min
    )
    return {
      lowestRate:       worst.attendanceRate,
      lowestCourseName: worst.courseId,
    }
  }, [attendanceReport])

  // Modal Handlers
  const openDetailsModal    = useCallback(() => setActiveModal('details'), [])
  const openRoutineModal    = useCallback(() => setActiveModal('routine'), [])
  const openAttendanceModal = useCallback(() => setActiveModal('attendance'), [])
  const closeModal          = useCallback(() => setActiveModal(null), [])

  // Stat Cards Configuration
  const stats = useMemo(() => [
    {
      id: 'enrolled',
      icon: '🎓',
      iconColor: 'teal',
      value: loading ? '...' : String(enrolledCount),
      label: 'Enrolled Courses',
      linkText: 'View details',
      isActive: true,
      onClick: openDetailsModal,
    },
    {
      id: 'routine',
      icon: '📅',
      iconColor: 'purple',
      value: loading ? '...' : String(weeklyClassCount),
      label: 'Classes This Week (Routine)',
      linkText: 'View schedule',
      isActive: false,
      onClick: openRoutineModal,
    },
    {
      id: 'attendance',
      icon: '✅',
      iconColor: lowestRate !== null && lowestRate < 70 ? 'red' : 'orange',
      value: loading
        ? '...'
        : lowestRate !== null
          ? `${lowestRate}%`
          : '—',
      label: loading
        ? 'Attendance Metrics'
        : lowestRate !== null
          ? (lowestCourseName ? `Lowest Attendance · ${lowestCourseName}` : 'Attendance (Lowest Course)')
          : 'No classes conducted yet',
      linkText: 'View report',
      isActive: false,
      onClick: openAttendanceModal,
    },
  ].filter(stat => isStudent || stat.id !== 'attendance'), [
    loading,
    enrolledCount,
    weeklyClassCount,
    lowestRate,
    lowestCourseName,
    openDetailsModal,
    openRoutineModal,
    openAttendanceModal,
    isStudent,
  ])

  return {
    today,
    fullName,
    stats,
    courses,
    attendanceReport,
    weeklyClassCount,
    routineGrid,
    loading,
    error,
    activeModal,
    openDetailsModal,
    openRoutineModal,
    openAttendanceModal,
    closeModal,
    showUpcomingExams,
    isStudent,
  }
}

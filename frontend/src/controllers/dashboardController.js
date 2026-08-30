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

/**
 * useDashboardController
 * Custom React hook powering DashboardView.
 */
export function useDashboardController(studentId = 'STU001') {
  const [courses,          setCourses]          = useState([])
  const [attendanceReport, setAttendanceReport] = useState(null)
  const [loading,          setLoading]          = useState(true)
  const [error,            setError]            = useState(null)
  const [activeModal,      setActiveModal]      = useState(null) // 'details' | 'routine' | 'attendance' | null

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
      dashboardService.getStudentAttendanceSummary(studentId),
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
  }, [studentId])

  // Computed metrics
  const enrolledCount     = courses.length
  const weeklyClassCount  = useMemo(() => calculateWeeklyClassCount(courses), [courses])
  const routineGrid       = useMemo(() => buildRoutineGrid(courses), [courses])

  // Show the LOWEST per-course attendance rate on the stat card so the
  // student immediately sees which course needs attention.
  // Falls back to the overall rate when no course breakdown is available.
  const { lowestRate, lowestCourseName } = useMemo(() => {
    const breakdown = attendanceReport?.courseBreakdown
    if (!breakdown || breakdown.length === 0) {
      return {
        lowestRate:       attendanceReport?.attendanceRate ?? null,
        lowestCourseName: null,
      }
    }
    const worst = breakdown.reduce((min, c) =>
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
      iconColor: 'orange',
      value: loading
        ? '...'
        : lowestRate !== null
          ? `${lowestRate}%`
          : '—',
      label: lowestCourseName
        ? `Lowest Attendance · ${lowestCourseName}`
        : 'Attendance (Lowest Course)',
      linkText: 'View report',
      isActive: false,
      onClick: openAttendanceModal,
    },
  ], [
    loading,
    enrolledCount,
    weeklyClassCount,
    lowestRate,
    lowestCourseName,
    openDetailsModal,
    openRoutineModal,
    openAttendanceModal,
  ])

  return {
    today,
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
  }
}

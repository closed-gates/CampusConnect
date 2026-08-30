/**
 * attendanceController.js – Controller layer for the Faculty Attendance Tracking page.
 *
 * MVC Role: Controller
 * Manages all state and handlers for course selection, attendance marking,
 * history viewing, and summary stats.
 * Used by AttendanceView.
 *
 * All data is fetched from and persisted to the real backend API (Neon PostgreSQL):
 *   GET  /api/attendance/faculty-courses?markedBy=X    → load faculty's course list
 *   GET  /api/attendance/enrolled-students?courseId=X  → load students in a course
 *   GET  /api/attendance?courseId=X&date=Y             → load attendance for a course/date
 *   POST /api/attendance                               → mark/update a single student's attendance
 *   GET  /api/attendance/summary?courseId=X            → summary stats for a course
 *   GET  /api/attendance/history?courseId=X            → full attendance history
 */

import { useState, useEffect, useMemo } from 'react'
import {
  getToday,
  getCourseColor,
  calculateSummary,
  groupByDate,
  EMPTY_SUMMARY,
} from '../models/attendanceModel.js'
import { getStoredUser } from '../models/authModel.js'
import apiClient from '../services/apiClient.js'

const API_BASE = '/api'

// Get the logged-in faculty member's name from the JWT token.
// Falls back to a default for backward compatibility.
function getFacultyName() {
  const user = getStoredUser()
  return user?.fullName || 'Dr. Mahbubur Rahman'
}

export function useAttendanceController() {
  const role      = localStorage.getItem('userRole') || 'student'
  const isFaculty = role === 'faculty' || role === 'admin'

  // ── Core State ──────────────────────────────────────────────
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedDate,   setSelectedDate]   = useState(getToday())
  const [activeTab,      setActiveTab]      = useState('mark')  // 'mark' | 'history' | 'summary'
  const [toast,          setToast]          = useState(null)

  // ── Course & Student State (live from API) ───────────────────
  const [courses,        setCourses]        = useState([])
  const [courseStudents, setCourseStudents] = useState([])

  // ── Loading flags ────────────────────────────────────────────
  const [loadingCourses,    setLoadingCourses]    = useState(true)
  const [loadingStudents,   setLoadingStudents]   = useState(false)
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [loadingHistory,    setLoadingHistory]    = useState(false)
  const [loadingSummary,    setLoadingSummary]    = useState(false)

  // ── Attendance records (from backend) ───────────────────────
  const [dateRecords,   setDateRecords]   = useState([])
  const [allRecords,    setAllRecords]    = useState([])
  const [courseSummary, setCourseSummary] = useState(EMPTY_SUMMARY)

  // ── Current session attendance (marking state) ───────────────
  const [currentMarks, setCurrentMarks] = useState({})
  const [submitting,   setSubmitting]   = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  function showToast(message, type = 'success') {
    setToast({ message, type })
  }

  // ── Load faculty courses from API on mount ───────────────────
  useEffect(() => {
    async function loadCourses() {
      setLoadingCourses(true)
      try {
        const facultyName = getFacultyName()
        const res = await apiClient.get(
          `${API_BASE}/attendance/faculty-courses?markedBy=${encodeURIComponent(facultyName)}`
        )
        if (res.ok) {
          const json = await res.json()
          const raw  = json.data || []
          const enriched = raw.map(c => ({
            id:            c.courseId,
            name:          c.courseName,
            totalStudents: c.studentCount,
            color:         getCourseColor(c.courseId),
          }))
          setCourses(enriched)
          if (enriched.length > 0) setSelectedCourse(enriched[0].id)
        }
      } catch (err) {
        console.error('[AttendanceController] Failed to load faculty courses:', err)
      } finally {
        setLoadingCourses(false)
      }
    }

    loadCourses()
  }, [])

  // ── Load enrolled students when selected course changes ───────
  useEffect(() => {
    if (!selectedCourse) return

    async function loadStudents() {
      setLoadingStudents(true)
      setCourseStudents([])
      try {
        const res = await apiClient.get(
          `${API_BASE}/attendance/enrolled-students?courseId=${encodeURIComponent(selectedCourse)}`
        )
        if (res.ok) {
          const json = await res.json()
          const raw  = json.data || []
          const students = raw.map(s => ({ id: s.studentId, name: s.studentName }))
          setCourseStudents(students)
        }
      } catch (err) {
        console.error('[AttendanceController] Failed to load students:', err)
      } finally {
        setLoadingStudents(false)
      }
    }

    loadStudents()
  }, [selectedCourse])

  // ── Derived data ────────────────────────────────────────────

  /** Selected course info object */
  const courseInfo = useMemo(() => {
    return courses.find(c => c.id === selectedCourse) || null
  }, [selectedCourse, courses])

  /** Attendance grouped by date (for history view) */
  const historyByDate = useMemo(() => {
    return groupByDate(allRecords)
  }, [allRecords])

  /** Unique dates in history, sorted descending */
  const historyDates = useMemo(() => {
    return Object.keys(historyByDate).sort((a, b) => b.localeCompare(a))
  }, [historyByDate])

  // ── Load attendance for the current course + date ───────────
  useEffect(() => {
    if (!selectedCourse || !selectedDate) return

    async function loadAttendance() {
      setLoadingAttendance(true)
      try {
        const res = await apiClient.get(
          `${API_BASE}/attendance?courseId=${encodeURIComponent(selectedCourse)}&date=${encodeURIComponent(selectedDate)}`
        )
        if (res.ok) {
          const json = await res.json()
          const records = json.data || []
          setDateRecords(records)
          const marks = {}
          records.forEach(r => { marks[r.studentId] = r.status })
          setCurrentMarks(marks)
          setHasSubmitted(records.length > 0)
        }
      } catch (err) {
        console.error('[AttendanceController] Failed to load attendance:', err)
      } finally {
        setLoadingAttendance(false)
      }
    }

    loadAttendance()
  }, [selectedCourse, selectedDate])

  // ── Load history + summary when course changes ───────────────
  useEffect(() => {
    if (!selectedCourse) return

    async function loadHistoryAndSummary() {
      setLoadingHistory(true)
      setLoadingSummary(true)

      try {
        const [histRes, sumRes] = await Promise.all([
          apiClient.get(`${API_BASE}/attendance/history?courseId=${encodeURIComponent(selectedCourse)}`),
          apiClient.get(`${API_BASE}/attendance/summary?courseId=${encodeURIComponent(selectedCourse)}`),
        ])

        if (histRes.ok) {
          const json = await histRes.json()
          setAllRecords(json.data || [])
        }

        if (sumRes.ok) {
          const json = await sumRes.json()
          const d = json.data || {}
          setCourseSummary({
            total:   d.totalRecords   || 0,
            present: d.presentCount   || 0,
            absent:  d.absentCount    || 0,
            late:    d.lateCount      || 0,
            rate:    d.attendanceRate || 0,
          })
        }
      } catch (err) {
        console.error('[AttendanceController] Failed to load history/summary:', err)
      } finally {
        setLoadingHistory(false)
        setLoadingSummary(false)
      }
    }

    loadHistoryAndSummary()
  }, [selectedCourse])

  // ── Handlers ────────────────────────────────────────────────

  /** Set a student's attendance status */
  function markStudent(studentId, status) {
    setCurrentMarks(prev => ({ ...prev, [studentId]: status }))
  }

  /** Mark all students as a given status */
  function markAll(status) {
    const marks = {}
    courseStudents.forEach(s => { marks[s.id] = status })
    setCurrentMarks(marks)
  }

  /** Submit attendance for the current course/date — posts each student to the backend */
  async function submitAttendance() {
    const unmarked = courseStudents.filter(s => !currentMarks[s.id])
    if (unmarked.length > 0) {
      showToast(`⚠️ Please mark attendance for all students (${unmarked.length} remaining)`, 'error')
      return
    }

    setSubmitting(true)

    try {
      const facultyName = getFacultyName()
      const promises = courseStudents.map(student =>
        apiClient.post(`${API_BASE}/attendance`, {
          courseId:    selectedCourse,
          courseName:  courseInfo?.name || selectedCourse,
          studentId:   student.id,
          studentName: student.name,
          date:        selectedDate,
          status:      currentMarks[student.id],
          markedBy:    facultyName,
        })
      )

      const results = await Promise.all(promises)
      const allOk = results.every(r => r.ok)

      if (allOk) {
        const [dateRes, histRes, sumRes] = await Promise.all([
          apiClient.get(`${API_BASE}/attendance?courseId=${encodeURIComponent(selectedCourse)}&date=${encodeURIComponent(selectedDate)}`),
          apiClient.get(`${API_BASE}/attendance/history?courseId=${encodeURIComponent(selectedCourse)}`),
          apiClient.get(`${API_BASE}/attendance/summary?courseId=${encodeURIComponent(selectedCourse)}`),
        ])

        if (dateRes.ok) { const j = await dateRes.json(); setDateRecords(j.data || []) }
        if (histRes.ok) { const j = await histRes.json(); setAllRecords(j.data || []) }
        if (sumRes.ok)  {
          const j = await sumRes.json()
          const d = j.data || {}
          setCourseSummary({
            total:   d.totalRecords   || 0,
            present: d.presentCount   || 0,
            absent:  d.absentCount    || 0,
            late:    d.lateCount      || 0,
            rate:    d.attendanceRate || 0,
          })
        }

        setHasSubmitted(true)
        showToast('✅ Attendance saved successfully!')
      } else {
        showToast('❌ Some records failed to save. Please try again.', 'error')
      }
    } catch (err) {
      console.error('[AttendanceController] submitAttendance error:', err)
      showToast('❌ Network error. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  /** Change the selected course */
  function selectCourse(courseId) {
    setSelectedCourse(courseId)
    setActiveTab('mark')
    setCurrentMarks({})
    setHasSubmitted(false)
    setDateRecords([])
    setAllRecords([])
    setCourseSummary(EMPTY_SUMMARY)
  }

  return {
    // Role
    isFaculty,
    // Course selection (live from API)
    courses,
    selectedCourse,
    selectCourse,
    courseInfo,
    courseStudents,
    // Date
    selectedDate,
    setSelectedDate,
    // Tab
    activeTab,
    setActiveTab,
    // Marking
    currentMarks,
    markStudent,
    markAll,
    submitAttendance,
    submitting,
    hasSubmitted,
    // Loading
    loadingCourses,
    loadingStudents,
    loadingAttendance,
    loadingHistory,
    loadingSummary,
    // History / Summary (from backend)
    dateRecords,
    courseRecords: allRecords,
    courseSummary,
    historyByDate,
    historyDates,
    // Toast
    toast,
  }
}

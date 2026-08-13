/**
 * attendanceController.js – Controller layer for the Faculty Attendance Tracking page.
 *
 * MVC Role: Controller
 * Manages all state and handlers for course selection, attendance marking,
 * history viewing, and summary stats.
 * Used by AttendanceView.
 *
 * Phase 3: All data is fetched from and persisted to the real backend API (Neon PostgreSQL).
 *   GET  /api/attendance?courseId=X&date=Y  → load attendance for a course/date
 *   POST /api/attendance                    → mark/update a single student's attendance
 *   GET  /api/attendance/summary?courseId=X → summary stats for a course
 *   GET  /api/attendance/history?courseId=X → full attendance history
 */

import { useState, useEffect, useMemo } from 'react'
import {
  FACULTY_COURSES,
  COURSE_STUDENTS,
  getToday,
  calculateSummary,
  groupByDate,
} from '../models/attendanceModel.js'

const API_BASE = 'http://localhost:8080/api'

export function useAttendanceController() {
  const role      = localStorage.getItem('userRole') || 'student'
  const isFaculty = role === 'faculty' || role === 'admin'

  // ── Core State ──────────────────────────────────────────────
  const [selectedCourse, setSelectedCourse] = useState(FACULTY_COURSES[0]?.id || '')
  const [selectedDate,   setSelectedDate]   = useState(getToday())
  const [activeTab,      setActiveTab]      = useState('mark')  // 'mark' | 'history' | 'summary'
  const [toast,          setToast]          = useState(null)

  // ── Loading flags ────────────────────────────────────────────
  const [loadingAttendance, setLoadingAttendance] = useState(false)
  const [loadingHistory,    setLoadingHistory]    = useState(false)
  const [loadingSummary,    setLoadingSummary]    = useState(false)

  // ── Attendance records (from backend) ───────────────────────
  const [dateRecords,   setDateRecords]   = useState([])  // records for selected course + date
  const [allRecords,    setAllRecords]    = useState([])  // full history for selected course
  const [courseSummary, setCourseSummary] = useState({ total: 0, present: 0, absent: 0, late: 0, rate: 0 })

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

  // ── Derived data ────────────────────────────────────────────

  /** Students enrolled in the selected course */
  const courseStudents = useMemo(() => {
    return COURSE_STUDENTS[selectedCourse] || []
  }, [selectedCourse])

  /** Selected course info */
  const courseInfo = useMemo(() => {
    return FACULTY_COURSES.find(c => c.id === selectedCourse) || null
  }, [selectedCourse])

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
        const res = await fetch(
          `${API_BASE}/attendance?courseId=${encodeURIComponent(selectedCourse)}&date=${encodeURIComponent(selectedDate)}`
        )
        if (res.ok) {
          const json = await res.json()
          const records = json.data || []
          setDateRecords(records)

          // Pre-fill current marks from existing records
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
          fetch(`${API_BASE}/attendance/history?courseId=${encodeURIComponent(selectedCourse)}`),
          fetch(`${API_BASE}/attendance/summary?courseId=${encodeURIComponent(selectedCourse)}`),
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
    // Validate: all students must have a status
    const unmarked = courseStudents.filter(s => !currentMarks[s.id])
    if (unmarked.length > 0) {
      showToast(`⚠️ Please mark attendance for all students (${unmarked.length} remaining)`, 'error')
      return
    }

    setSubmitting(true)

    try {
      // POST each student's attendance record to the backend
      const markedBy = 'Dr. Mahbubur Rahman'
      const promises = courseStudents.map(student =>
        fetch(`${API_BASE}/attendance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId:    selectedCourse,
            courseName:  courseInfo?.name || selectedCourse,
            studentId:   student.id,
            studentName: student.name,
            date:        selectedDate,
            status:      currentMarks[student.id],
            markedBy,
          }),
        })
      )

      const results = await Promise.all(promises)
      const allOk = results.every(r => r.ok)

      if (allOk) {
        // Refresh date records and history/summary after submit
        const [dateRes, histRes, sumRes] = await Promise.all([
          fetch(`${API_BASE}/attendance?courseId=${encodeURIComponent(selectedCourse)}&date=${encodeURIComponent(selectedDate)}`),
          fetch(`${API_BASE}/attendance/history?courseId=${encodeURIComponent(selectedCourse)}`),
          fetch(`${API_BASE}/attendance/summary?courseId=${encodeURIComponent(selectedCourse)}`),
        ])

        if (dateRes.ok) {
          const json = await dateRes.json()
          setDateRecords(json.data || [])
        }
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
  }

  return {
    // Role
    isFaculty,
    // Course selection
    courses: FACULTY_COURSES,
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

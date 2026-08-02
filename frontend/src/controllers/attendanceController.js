/**
 * attendanceController.js – Controller layer for the Faculty Attendance Tracking page.
 *
 * MVC Role: Controller
 * Manages all state and handlers for course selection, attendance marking,
 * history viewing, and summary stats.
 * Used by AttendanceView.
 *
 * TODO (Phase 2): Wire API calls:
 *   GET  /api/attendance?courseId=X&date=Y  → getAttendance
 *   POST /api/attendance                    → markAttendance
 *   GET  /api/attendance/summary?courseId=X  → getCourseSummary
 *   GET  /api/attendance/history?courseId=X  → getCourseHistory
 */

import { useState, useEffect, useMemo } from 'react'
import {
  FACULTY_COURSES,
  COURSE_STUDENTS,
  SEED_ATTENDANCE_HISTORY,
  getToday,
  calculateSummary,
  groupByDate,
} from '../models/attendanceModel.js'

export function useAttendanceController() {
  const role      = localStorage.getItem('userRole') || 'student'
  const isFaculty = role === 'faculty' || role === 'admin'

  // ── Core State ──────────────────────────────────────────────
  const [selectedCourse, setSelectedCourse] = useState(FACULTY_COURSES[0]?.id || '')
  const [selectedDate,   setSelectedDate]   = useState(getToday())
  const [activeTab,      setActiveTab]      = useState('mark')  // 'mark' | 'history' | 'summary'
  const [toast,          setToast]          = useState(null)

  // ── Attendance records (in-memory for Phase 1) ──────────────
  const [allRecords, setAllRecords] = useState([...SEED_ATTENDANCE_HISTORY])
  const [idCounter, setIdCounter]   = useState(100)

  // ── Current session attendance (today's marking) ────────────
  // Maps studentId → status ('PRESENT' | 'ABSENT' | 'LATE' | null)
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

  /** Records for the selected course and date */
  const dateRecords = useMemo(() => {
    return allRecords.filter(
      r => r.courseId === selectedCourse && r.date === selectedDate
    )
  }, [allRecords, selectedCourse, selectedDate])

  /** All records for the selected course (for history/summary) */
  const courseRecords = useMemo(() => {
    return allRecords.filter(r => r.courseId === selectedCourse)
  }, [allRecords, selectedCourse])

  /** Summary stats for the selected course */
  const courseSummary = useMemo(() => {
    return calculateSummary(courseRecords)
  }, [courseRecords])

  /** Attendance grouped by date (for history view) */
  const historyByDate = useMemo(() => {
    return groupByDate(courseRecords)
  }, [courseRecords])

  /** Unique dates in history, sorted descending */
  const historyDates = useMemo(() => {
    return Object.keys(historyByDate).sort((a, b) => b.localeCompare(a))
  }, [historyByDate])

  // ── Initialize marks when course/date changes ──────────────
  useEffect(() => {
    const marks = {}
    const existing = allRecords.filter(
      r => r.courseId === selectedCourse && r.date === selectedDate
    )
    // Pre-fill from existing records
    existing.forEach(r => { marks[r.studentId] = r.status })
    setCurrentMarks(marks)
    setHasSubmitted(existing.length > 0)
  }, [selectedCourse, selectedDate, allRecords])

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

  /** Submit attendance for the current course/date */
  async function submitAttendance() {
    // Validate: all students must have a status
    const unmarked = courseStudents.filter(s => !currentMarks[s.id])
    if (unmarked.length > 0) {
      showToast(`⚠️ Please mark attendance for all students (${unmarked.length} remaining)`, 'error')
      return
    }

    setSubmitting(true)
    await new Promise(r => setTimeout(r, 600)) // simulate network

    // Build new records, replacing any existing for same course+date+student
    let nextId = idCounter
    const newRecords = courseStudents.map(student => ({
      id: nextId++,
      courseId: selectedCourse,
      studentId: student.id,
      studentName: student.name,
      date: selectedDate,
      status: currentMarks[student.id],
    }))

    setIdCounter(nextId)

    // Remove old records for this course+date, add new ones
    setAllRecords(prev => {
      const filtered = prev.filter(
        r => !(r.courseId === selectedCourse && r.date === selectedDate)
      )
      return [...filtered, ...newRecords]
    })

    setSubmitting(false)
    setHasSubmitted(true)
    showToast('✅ Attendance saved successfully!')
  }

  /** Change the selected course */
  function selectCourse(courseId) {
    setSelectedCourse(courseId)
    setActiveTab('mark')
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
    // History / Summary
    dateRecords,
    courseRecords,
    courseSummary,
    historyByDate,
    historyDates,
    // Toast
    toast,
  }
}

/**
 * advisingController.js – Controller layer for the Advising page (v2).
 *
 * MVC Role: Controller
 * Provides two hooks:
 *   useStudentAdvisingController() – for students viewing their assigned courses
 *   useAdvisorController()         – for advisors assigning courses to students
 *
 * Credit/course limits are fully driven by the backend (profile.courseLimit,
 * profile.creditLimit) which is computed from CGPA:
 *   CGPA >= 3.5  → 5 courses, 15 credits
 *   CGPA >= 2.0  → 4 courses, 12 credits
 *   Probationary → 3 courses,  9 credits
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { CREDITS_PER_COURSE } from '../models/advisingModel.js'
import { courseService } from '../services/courseService.js'
import { channelService } from '../services/channelService.js'

const API_BASE = '/api/advisors'

/**
 * Sorts courses by course code, and by section number in ascending numerical order.
 * e.g. CSE110-01, CSE110-02, ..., CSE110-10, CSE111-01, ...
 */
function sortCoursesByCodeAndSection(a, b) {
  const codeA = (a.code || '').toUpperCase()
  const codeB = (b.code || '').toUpperCase()
  const codeCmp = codeA.localeCompare(codeB, undefined, { numeric: true, sensitivity: 'base' })
  if (codeCmp !== 0) return codeCmp

  const secA = parseInt(a.section, 10)
  const secB = parseInt(b.section, 10)

  if (isNaN(secA) && isNaN(secB)) {
    return (a.section || '').localeCompare(b.section || '')
  }
  if (isNaN(secA)) return 1
  if (isNaN(secB)) return -1

  return secA - secB
}

/* ═══════════════════════════════════════════════════════════════
   STUDENT HOOK — view assigned courses
═══════════════════════════════════════════════════════════════ */
export function useStudentAdvisingController() {
  // Phase 1: student is always STU001 (no real auth yet)
  const STUDENT_ID = 'STU001'
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/student/${STUDENT_ID}`)
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      setProfile(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  return { profile, loading, error, refetch: fetchProfile }
}

/* ═══════════════════════════════════════════════════════════════
   ADVISOR HOOK — manage student course assignment
═══════════════════════════════════════════════════════════════ */
export function useAdvisorController() {
  const [students,        setStudents]        = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [profile,         setProfile]         = useState(null)
  const [allCourses,      setAllCourses]      = useState([])
  const [courseSearch,    setCourseSearch]     = useState('')
  const [loading,         setLoading]         = useState(false)
  const [profileLoading,  setProfileLoading]  = useState(false)
  const [coursesLoading,  setCoursesLoading]  = useState(false)
  const [toast,           setToast]           = useState(null)
  const [toastType,       setToastType]       = useState('success')
  /**
   * seatUpdates: Map<courseId, additionalBookings>
   * Tracks how many times each course has been booked through the advisor
   * panel this session so we can show live seat counts.
   */
  const [seatUpdates, setSeatUpdates] = useState({})

  /* Load all students + initial seat state + course sections on mount */
  useEffect(() => {
    setLoading(true)
    setCoursesLoading(true)
    Promise.all([
      fetch(`${API_BASE}/students`).then(r => r.json()),
      fetch(`${API_BASE}/seat-updates`).then(r => r.json()).catch(() => ({})),
      courseService.getSections().catch(() => fetch('/api/courses/sections').then(r => r.json()).catch(() => [])),
    ])
      .then(([studentsData, seatData, coursesData]) => {
        setStudents(studentsData || [])
        setSeatUpdates(seatData || {})
        setAllCourses(coursesData || [])
        if (studentsData && studentsData.length > 0) loadStudent(studentsData[0].studentId)
      })
      .catch(() => showToast('Could not load advising data', 'error'))
      .finally(() => {
        setLoading(false)
        setCoursesLoading(false)
      })
  }, [])

  /* Load a specific student's profile */
  const loadStudent = useCallback(async (studentId) => {
    setProfileLoading(true)
    setProfile(null)
    setSelectedStudent(studentId)
    try {
      const res = await fetch(`${API_BASE}/student/${studentId}`)
      if (!res.ok) throw new Error()
      setProfile(await res.json())
    } catch {
      showToast('Could not load student profile', 'error')
    } finally {
      setProfileLoading(false)
    }
  }, [])

  /* Assign a course */
  const handleAssign = useCallback(async (course) => {
    if (!profile) return
    try {
      const res = await fetch(`${API_BASE}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId:   profile.studentId,
          courseId:    course.id,
          courseCode:  course.code,
          courseTitle: course.title,
          section:     course.section,
          time:        course.time,
          room:        course.room,
          faculty:     course.faculty,
          advisorName: 'Dr. Sarah Ahmed',
        }),
      })
      const data = await res.json()
      if (data.success) {
        setProfile(data.profile)
        if (data.seatUpdates) setSeatUpdates(data.seatUpdates)
        channelService.onEnrollment({
          userId: 'usr_eusha_001',
          course: {
            code: course.courseCode || course.code,
            name: course.courseTitle || course.title || course.name || 'Course'
          }
        })
        showToast(data.message, 'success')
      } else {
        showToast(data.message, 'error')
      }
    } catch {
      showToast('Network error. Could not assign course.', 'error')
    }
  }, [profile])

  /* Remove a course */
  const handleRemove = useCallback(async (courseId) => {
    if (!profile) return
    try {
      const res = await fetch(`${API_BASE}/assign/${profile.studentId}/${courseId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setProfile(data.profile)
        if (data.seatUpdates) setSeatUpdates(data.seatUpdates)
        showToast('Course removed.', 'success')
      } else {
        showToast(data.message, 'error')
      }
    } catch {
      showToast('Network error. Could not remove course.', 'error')
    }
  }, [profile])

  const showToast = (msg, type = 'success') => {
    setToast(msg)
    setToastType(type)
    setTimeout(() => setToast(null), 4500)
  }

  /* Derived: use limits from backend profile (CGPA-based) */
  const creditLimit  = profile?.creditLimit  ?? 15
  const courseLimit  = profile?.courseLimit  ?? 5
  const creditUsed   = (profile?.advisedCourses?.length ?? 0) * CREDITS_PER_COURSE
  const courseCount  = profile?.advisedCourses?.length ?? 0

  /* Derived: filtered & sorted course sections */
  const filteredCourses = useMemo(() => {
    let list = [...allCourses]
    if (courseSearch.trim()) {
      const q = courseSearch.toLowerCase()
      list = list.filter(c =>
        (c.code && c.code.toLowerCase().includes(q)) ||
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.section && String(c.section).toLowerCase().includes(q)) ||
        (c.faculty && c.faculty.toLowerCase().includes(q))
      )
    }
    return list.sort(sortCoursesByCodeAndSection)
  }, [allCourses, courseSearch])

  return {
    students, selectedStudent, profile,
    courseSearch, setCourseSearch,
    filteredCourses,
    loading, profileLoading, coursesLoading,
    toast, toastType,
    creditUsed, creditLimit, courseCount, courseLimit,
    seatUpdates,
    handleSelectStudent: loadStudent,
    handleAssign,
    handleRemove,
  }
}

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
import { testCourseService } from '../services/testCourseService.js'
import { channelService } from '../services/channelService.js'
import { getStoredUser } from '../models/authModel.js'
import apiClient from '../services/apiClient.js'
import { getPreferredSemester, toSemesterApiTerm } from '../models/accountSettingsModel.js'

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

/**
 * Parses course schedules into a structured routine by day.
 */
function parseStudentRoutine(advisedCourses = []) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const routine = []

  advisedCourses.forEach(c => {
    const rawTime = c.time || ''
    // Format 1: SUNDAY(8:00 AM-9:20 AM-09A-05C) ; TUESDAY(8:00 AM-9:20 AM-09A-05C)
    if (rawTime.includes('(') && rawTime.includes(')')) {
      const parts = rawTime.split(';')
      parts.forEach(p => {
        const trimmed = p.trim()
        const parenIdx = trimmed.indexOf('(')
        if (parenIdx > 0) {
          const dayPart = trimmed.substring(0, parenIdx).trim()
          const inside = trimmed.substring(parenIdx + 1, trimmed.indexOf(')')).trim()
          const matchedDay = days.find(d => d.toUpperCase().startsWith(dayPart.toUpperCase().slice(0, 3))) || dayPart
          routine.push({
            id: `${c.id}-${matchedDay}`,
            courseCode: c.courseCode,
            section: c.section,
            day: matchedDay,
            time: inside,
            room: c.room || 'TBA',
            faculty: c.faculty || 'TBA'
          })
        }
      })
    } else {
      // Format 2: SUN-TUE 08:00 AM–09:20 AM
      routine.push({
        id: `${c.id}-default`,
        courseCode: c.courseCode,
        section: c.section,
        day: rawTime.split(' ')[0] || 'Schedule',
        time: rawTime.split(' ').slice(1).join(' ') || rawTime,
        room: c.room || 'TBA',
        faculty: c.faculty || 'TBA'
      })
    }
  })

  return routine
}

/* ═══════════════════════════════════════════════════════════════
   STUDENT HOOK — view assigned courses
═══════════════════════════════════════════════════════════════ */
export function useStudentAdvisingController() {
  const user = getStoredUser()
  const studentId = user?.userId || 'STU001'
  const preferredSemester = getPreferredSemester()
  const preferredTerm = toSemesterApiTerm(preferredSemester)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.get(`${API_BASE}/student/${studentId}?term=${encodeURIComponent(preferredTerm)}`)
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      setProfile(await res.json())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [studentId, preferredTerm])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  return { profile, loading, error, preferredSemester, refetch: fetchProfile }
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
  const [catalogFilter,   setCatalogFilter]    = useState('all') // 'all' | 'test' | 'catalog'
  const [loading,         setLoading]         = useState(false)
  const [profileLoading,  setProfileLoading]  = useState(false)
  const [coursesLoading,  setCoursesLoading]  = useState(false)
  const [toast,           setToast]           = useState(null)
  const [toastType,       setToastType]       = useState('success')
  const [seatUpdates,     setSeatUpdates]     = useState({})
  const [confirming,      setConfirming]      = useState(false)

  const currentUser = getStoredUser()
  const advisorName = currentUser?.fullName || 'Advisor'
  const preferredSemester = getPreferredSemester()
  const preferredTerm = toSemesterApiTerm(preferredSemester)

  /* Load all students + initial seat state + course sections on mount */
  const loadInitialData = useCallback(() => {
    setLoading(true)
    setCoursesLoading(true)
    Promise.all([
      apiClient.get(`${API_BASE}/students?term=${encodeURIComponent(preferredTerm)}`).then(r => r.json()),
      apiClient.get(`${API_BASE}/seat-updates`).then(r => r.json()).catch(() => ({})),
      courseService.getSections().catch(() => apiClient.get('/api/courses/sections').then(r => r.json()).catch(() => [])),
      testCourseService.getSections().catch(() => apiClient.get('/api/test-courses/sections').then(r => r.json()).catch(() => [])),
    ])
      .then(([studentsData, seatData, coursesData, testSectionsData]) => {
        setStudents(studentsData || [])
        setSeatUpdates(seatData || {})

        const mappedTestCourses = (testSectionsData || []).map(s => ({
          id: s.sectionId || `TEST-${s.id}`,
          sectionId: s.sectionId,
          code: s.courseCode,
          title: s.courseTitle,
          section: s.sectionNumber,
          time: s.scheduleTime,
          room: s.room,
          faculty: s.facultyName,
          totalSeats: s.totalSeats,
          booked: s.bookedSeats,
          seatsRemaining: s.seatsRemaining ?? Math.max(0, (s.totalSeats || 0) - (s.bookedSeats || 0)),
          credits: s.credits || 3,
          department: s.department,
          term: s.term,
          isTestCourse: true,
        }))

        // Test courses first, followed by regular courses
        setAllCourses([...mappedTestCourses, ...(coursesData || [])])
        if (studentsData && studentsData.length > 0) loadStudent(studentsData[0].studentId)
      })
      .catch(() => showToast('Could not load advising data', 'error'))
      .finally(() => {
        setLoading(false)
        setCoursesLoading(false)
      })
  }, [preferredTerm])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  /* Load a specific student's profile */
  const loadStudent = useCallback(async (studentId) => {
    setProfileLoading(true)
    setProfile(null)
    setSelectedStudent(studentId)
    try {
      const res = await apiClient.get(`${API_BASE}/student/${studentId}?term=${encodeURIComponent(preferredTerm)}`)
      if (!res.ok) throw new Error()
      setProfile(await res.json())
    } catch {
      showToast('Could not load student profile', 'error')
    } finally {
      setProfileLoading(false)
    }
  }, [preferredTerm])

  /* Assign a course */
  const handleAssign = useCallback(async (course) => {
    if (!profile) return
    try {
      const res = await apiClient.post(`${API_BASE}/assign`, {
        studentId:   profile.studentId,
        courseId:    course.id,
        courseCode:  course.code,
        courseTitle: course.title,
        section:     course.section,
        time:        course.time,
        room:        course.room,
        faculty:     course.faculty,
        advisorName: advisorName,
        term: preferredTerm,
      })
      const data = await res.json()
      if (data.success) {
        setProfile(data.profile)
        if (data.seatUpdates) setSeatUpdates(data.seatUpdates)
        channelService.onEnrollment({
          userId: profile.studentId,
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
  }, [profile, advisorName, preferredTerm])

  /* Remove a course */
  const handleRemove = useCallback(async (courseId) => {
    if (!profile) return
    const prevProfile = profile
    const toRemove = (profile.advisedCourses || []).find(c => String(c.id) === String(courseId) || c.sectionId === courseId)

    // Optimistically remove course from local UI state immediately
    setProfile(prev => {
      if (!prev) return prev
      const updatedList = (prev.advisedCourses || []).filter(c => String(c.id) !== String(courseId) && c.sectionId !== courseId)
      return {
        ...prev,
        advisedCourses: updatedList
      }
    })

    if (toRemove) {
      channelService.onDropCourse({
        userId: profile.studentId,
        courseCode: toRemove.courseCode || toRemove.code
      })
    }

    try {
      const res = await apiClient.delete(`${API_BASE}/assign/${profile.studentId}/${courseId}?term=${encodeURIComponent(preferredTerm)}`)
      const data = await res.json()
      if (data.success) {
        setProfile(data.profile)
        if (data.seatUpdates) setSeatUpdates(data.seatUpdates)
        showToast('Course removed.', 'success')
      } else {
        // Roll back if error
        setProfile(prevProfile)
        showToast(data.message || 'Failed to remove course.', 'error')
      }
    } catch {
      setProfile(prevProfile)
      showToast('Network error. Could not remove course.', 'error')
    }
  }, [profile, preferredTerm])

  const showToast = (msg, type = 'success') => {
    setToast(msg)
    setToastType(type)
    setTimeout(() => setToast(null), 4500)
  }

  /* Confirm advising */
  const handleConfirmAdvising = useCallback(async () => {
    if (!profile) return
    if (!profile.advisedCourses || profile.advisedCourses.length === 0) {
      showToast('Please assign at least one course before confirming advising.', 'error')
      return
    }

    setConfirming(true)
    try {
      const res = await apiClient.post(`${API_BASE}/confirm/${profile.studentId}`, {
        advisorName: advisorName,
        term: preferredTerm,
      })
      const data = await res.json()
      if (data.success) {
        setProfile(data.profile)
        showToast(data.message || 'Advising confirmed and saved to database successfully!', 'success')
      } else {
        showToast(data.message || 'Failed to confirm advising.', 'error')
      }
    } catch {
      showToast('Network error. Could not confirm advising.', 'error')
    } finally {
      setConfirming(false)
    }
  }, [profile, advisorName, preferredTerm])

  /* Derived: use limits from backend profile (CGPA-based) */
  const creditLimit  = profile?.creditLimit  ?? 15
  const courseLimit  = profile?.courseLimit  ?? 5
  const creditUsed   = (profile?.advisedCourses?.length ?? 0) * CREDITS_PER_COURSE
  const courseCount  = profile?.advisedCourses?.length ?? 0

  /* Derived: student routine breakdown */
  const studentRoutine = useMemo(() => {
    return parseStudentRoutine(profile?.advisedCourses || [])
  }, [profile?.advisedCourses])

  /* Derived: filtered & sorted course sections */
  const filteredCourses = useMemo(() => {
    let list = [...allCourses]
    if (catalogFilter === 'test') {
      list = list.filter(c => c.isTestCourse)
    } else if (catalogFilter === 'catalog') {
      list = list.filter(c => !c.isTestCourse)
    }
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
  }, [allCourses, courseSearch, catalogFilter])

  return {
    students, selectedStudent, profile,
    courseSearch, setCourseSearch,
    catalogFilter, setCatalogFilter,
    allCourses,
    filteredCourses,
    studentRoutine,
    loading, profileLoading, coursesLoading, confirming,
    toast, toastType,
    creditUsed, creditLimit, courseCount, courseLimit,
    seatUpdates,
    preferredSemester,
    handleSelectStudent: loadStudent,
    handleAssign,
    handleRemove,
    handleConfirmAdvising,
    refreshCourses: loadInitialData,
  }
}

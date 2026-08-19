/**
 * coursesController.js – Controller layer for the Courses Catalog page.
 *
 * MVC Role: Controller
 *
 * Manages all filter/search/sort state for CoursesView.
 * Fetches real BRACU course data from the backend (Neon DB).
 * Enrollment is persisted to the database AND cached in localStorage.
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import { FACULTIES, YEARS, SEMESTERS } from '../models/coursesModel.js'
import { courseService } from '../services/courseService.js'
import { channelService } from '../services/channelService.js'
import { CURRENT_USER } from '../models/messagingModel.js'

const ENROLLED_IDS_KEY = 'cc_enrolled_course_ids_v1'

/* ── Pure helper ─────────────────────────────────────────────── */

/**
 * Returns availability status label and colors for a course.
 */
export function getAvailability(enrolled, capacity) {
  const pct = (enrolled / capacity) * 100
  if (pct >= 95) return { label: 'Full',        color: '#EF4444', bg: '#FEF2F2' }
  if (pct >= 75) return { label: 'Almost Full', color: '#F59E0B', bg: '#FFFBEB' }
  return               { label: 'Open',         color: '#10B981', bg: '#ECFDF5' }
}

/* ── Normaliser: maps DB fields to frontend shape ────────────── */
/**
 * The backend returns { facultyId, description, ... }.
 * The frontend expects { faculty, desc, tags: Array, ... }.
 */
function normaliseCourse(c) {
  return {
    ...c,
    faculty: c.facultyId,
    desc:    c.description,
    tags:    typeof c.tags === 'string'
               ? c.tags.split(',').map(t => t.trim()).filter(Boolean)
               : (c.tags || []),
  }
}

/* ── Controller Hook ─────────────────────────────────────────── */

/**
 * useCoursesController
 * Fetches BRACU courses from Neon DB, manages search/filter/view state.
 */
export function useCoursesController() {
  // ── Remote data state ─────────────────────────────────────────
  const [allCourses, setAllCourses] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  // ── Filter / UI state ─────────────────────────────────────────
  const [searchQuery,    setSearchQuery]    = useState('')
  const [activeFaculty,  setActiveFaculty]  = useState('all')
  const [activeYear,     setActiveYear]     = useState('All Years')
  const [activeSemester, setActiveSemester] = useState('All Semesters')
  const [viewMode,       setViewMode]       = useState('grid')

  /** Enrolled IDs: sourced from DB, cached in localStorage */
  const [enrolledIds, setEnrolledIds] = useState(() => {
    try {
      const raw = localStorage.getItem(ENROLLED_IDS_KEY)
      return raw ? new Set(JSON.parse(raw)) : new Set()
    } catch {
      return new Set()
    }
  })

  const [enrollToast, setEnrollToast] = useState(null)

  // ── Fetch courses from Neon DB on mount ───────────────────────
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    courseService.getCatalog()
      .then(data => {
        if (!cancelled) {
          setAllCourses(data.map(normaliseCourse))
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('[CoursesController] Failed to fetch catalog:', err)
          setError('Could not load courses. Please check the backend is running.')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [])

  /**
   * handleEnroll – joins the course discussion channel (persisted in localStorage).
   * Official course registration is performed via the Advising module.
   */
  const handleEnroll = useCallback(async (course) => {
    if (enrolledIds.has(String(course.id))) return

    setEnrolledIds(prev => {
      const next = new Set([...prev, String(course.id)])
      try {
        localStorage.setItem(ENROLLED_IDS_KEY, JSON.stringify(Array.from(next)))
      } catch (e) { /* ignore */ }
      return next
    })

    try {
      const channel = await channelService.onEnrollment({ userId: CURRENT_USER.id, course })
      setEnrollToast(`✅ Joined ${course.code} discussion · Channel ${channel.name} ready!`)
    } catch {
      setEnrollToast(`✅ Joined ${course.code}!`)
    }
    setTimeout(() => setEnrollToast(null), 4000)
  }, [enrolledIds])

  /* Derived: client-side filtered courses */
  const filtered = useMemo(() => {
    let r = [...allCourses]
    if (activeFaculty !== 'all')         r = r.filter(c => c.faculty === activeFaculty)
    if (activeYear !== 'All Years') {
      const yr = parseInt(activeYear.replace('Year ', ''))
      r = r.filter(c => c.year === yr)
    }
    if (activeSemester !== 'All Semesters') r = r.filter(c => c.semester === activeSemester)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      r = r.filter(c =>
        c.name.toLowerCase().includes(q)       ||
        c.code.toLowerCase().includes(q)       ||
        c.instructor.toLowerCase().includes(q) ||
        c.desc?.toLowerCase().includes(q)      ||
        c.tags?.some(t => t.toLowerCase().includes(q))
      )
    }
    return r
  }, [allCourses, searchQuery, activeFaculty, activeYear, activeSemester])

  /* Derived: grouped by faculty (only when showing all) */
  const grouped = useMemo(() => {
    if (activeFaculty !== 'all') return null
    const map = {}
    for (const fac of FACULTIES) {
      const courses = filtered.filter(c => c.faculty === fac.id)
      if (courses.length > 0) map[fac.id] = courses
    }
    return map
  }, [filtered, activeFaculty])

  const facultyMap = useMemo(() => Object.fromEntries(FACULTIES.map(f => [f.id, f])), [])
  const total      = filtered.length

  return {
    // Remote state
    loading, error,
    // Filter state
    searchQuery,    setSearchQuery,
    activeFaculty,  setActiveFaculty,
    activeYear,     setActiveYear,
    activeSemester, setActiveSemester,
    viewMode,       setViewMode,
    // Derived
    filtered, grouped, facultyMap, total,
    // Static data (passed through for the View)
    FACULTIES, YEARS, SEMESTERS,
    totalCourses: allCourses.length,
    // Enrollment
    enrolledIds, enrollToast, handleEnroll,
  }
}

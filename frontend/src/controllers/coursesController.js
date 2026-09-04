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
import { getCurrentUser } from '../models/messagingModel.js'
import { getPreferredSemester, loadPreferences, toSemesterSeason } from '../models/accountSettingsModel.js'

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
    // Legacy alias (kept for backward compat)
    faculty:    c.facultyId || 'bracu',
    desc:       c.description || '',
    tags:       typeof c.tags === 'string'
                  ? c.tags.split(',').map(t => t.trim()).filter(Boolean)
                  : (c.tags || []),
    // New BRACU real fields
    department:        c.department || '',
    school:            c.school     || '',
    isGenEd:           c.isGenEd    ?? false,
    prereqs:           c.prerequisites || '',
    instructor:        c.instructor   || 'TBA',
    midExamSchedule:   c.midExamSchedule || '',
    finalExamSchedule: c.finalExamSchedule || '',
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
  // The account preference seeds this filter once. Subsequent choices made on
  // this page remain fully controlled by the user.
  const [activeSemester, setActiveSemester] = useState(() => {
    const preferredSeason = toSemesterSeason(getPreferredSemester())
    return SEMESTERS.includes(preferredSeason) ? preferredSeason : 'All Semesters'
  })
  const [viewMode, setViewMode] = useState(() => {
    const preferredView = loadPreferences().academic?.courseView
    return preferredView === 'list' ? 'list' : 'grid'
  })

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
          const courses = data.map(normaliseCourse)
          setAllCourses(courses)
          // A saved semester preference must not make a populated catalog look
          // empty when the imported dataset contains a different semester.
          setActiveSemester(current =>
            current === 'All Semesters' || courses.some(course => course.semester === current)
              ? current
              : 'All Semesters'
          )
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
      } catch { /* ignore unavailable storage */ }
      return next
    })

    try {
      const channel = await channelService.onEnrollment({ userId: getCurrentUser().id, course })
      setEnrollToast(`✅ Joined ${course.code} discussion · Channel ${channel.name} ready!`)
    } catch {
      setEnrollToast(`✅ Joined ${course.code}!`)
    }
    setTimeout(() => setEnrollToast(null), 4000)
  }, [enrolledIds])

  /* Derived: client-side filtered courses */
  const filtered = useMemo(() => {
    let r = [...allCourses]
    // Filter by school: match the school's `value` string against c.school
    if (activeFaculty !== 'all') {
      const schoolEntry = FACULTIES.find(f => f.id === activeFaculty)
      if (schoolEntry) {
        r = r.filter(c => c.school === schoolEntry.value)
      }
    }
    if (activeYear !== 'All Years') {
      const yr = parseInt(activeYear.replace('Year ', ''))
      r = r.filter(c => c.year === yr)
    }
    if (activeSemester !== 'All Semesters') r = r.filter(c => c.semester === activeSemester)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      r = r.filter(c =>
        c.name.toLowerCase().includes(q)           ||
        c.code.toLowerCase().includes(q)           ||
        (c.instructor || '').toLowerCase().includes(q) ||
        (c.desc || '').toLowerCase().includes(q)   ||
        (c.department || '').toLowerCase().includes(q) ||
        (c.school || '').toLowerCase().includes(q) ||
        c.tags?.some(t => t.toLowerCase().includes(q))
      )
    }
    return r
  }, [allCourses, searchQuery, activeFaculty, activeYear, activeSemester])

  /* Derived: grouped by school (only when showing all) */
  const grouped = useMemo(() => {
    if (activeFaculty !== 'all') return null
    const map = {}
    for (const fac of FACULTIES) {
      const courses = filtered.filter(c => c.school === fac.value)
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

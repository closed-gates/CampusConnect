/**
 * coursesController.js – Controller layer for the Courses Catalog page.
 *
 * MVC Role: Controller
 * Manages all filter/search/sort state for CoursesView.
 */

import { useState, useMemo, useCallback } from 'react'
import { COURSES, FACULTIES } from '../models/coursesModel.js'
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

/* ── Controller Hook ─────────────────────────────────────────── */

/**
 * useCoursesController
 * Manages search, filter, and view-mode state for the course catalog.
 */
export function useCoursesController() {
  const [searchQuery,    setSearchQuery]    = useState('')
  const [activeFaculty,  setActiveFaculty]  = useState('all')
  const [activeYear,     setActiveYear]     = useState('All Years')
  const [activeSemester, setActiveSemester] = useState('All Semesters')
  const [viewMode,       setViewMode]       = useState('grid')

  /** Set of courseIds the current user has enrolled in (persisted) */
  const [enrolledIds, setEnrolledIds] = useState(() => {
    try {
      const raw = localStorage.getItem(ENROLLED_IDS_KEY)
      return raw ? new Set(JSON.parse(raw)) : new Set()
    } catch {
      return new Set()
    }
  })

  const [enrollToast, setEnrollToast] = useState(null)

  /**
   * handleEnroll – enrollment event hook.
   * Marks course enrolled, provisions channel, shows toast.
   */
  const handleEnroll = useCallback(async (course) => {
    if (enrolledIds.has(course.id)) return          // already enrolled

    setEnrolledIds(prev => {
      const next = new Set([...prev, course.id])
      try {
        localStorage.setItem(ENROLLED_IDS_KEY, JSON.stringify(Array.from(next)))
      } catch (e) {
        console.warn('Could not persist enrolledIds to localStorage', e)
      }
      return next
    })

    const channel = await channelService.onEnrollment({
      userId: CURRENT_USER.id,
      course,
    })
    setEnrollToast(`✅ Enrolled in ${course.code} · Channel ${channel.name} ready!`)
    setTimeout(() => setEnrollToast(null), 4000)
  }, [enrolledIds])

  /* Derived: filtered course list */
  const filtered = useMemo(() => {
    let r = [...COURSES]
    if (activeFaculty !== 'all') r = r.filter(c => c.faculty === activeFaculty)
    if (activeYear !== 'All Years') {
      const yr = parseInt(activeYear.replace('Year ', ''))
      r = r.filter(c => c.year === yr)
    }
    if (activeSemester !== 'All Semesters') r = r.filter(c => c.semester === activeSemester)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      r = r.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.desc.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      )
    }
    return r
  }, [searchQuery, activeFaculty, activeYear, activeSemester])

  /* Derived: grouped by faculty (only when showing "all faculties") */
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
    // Filter state
    searchQuery,    setSearchQuery,
    activeFaculty,  setActiveFaculty,
    activeYear,     setActiveYear,
    activeSemester, setActiveSemester,
    viewMode,       setViewMode,
    // Derived
    filtered,
    grouped,
    facultyMap,
    total,
    // Static data (passed through for the View)
    FACULTIES,
    totalCourses: COURSES.length,
    // Enrollment
    enrolledIds,
    enrollToast,
    handleEnroll,
  }
}

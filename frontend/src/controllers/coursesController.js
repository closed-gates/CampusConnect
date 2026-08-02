/**
 * coursesController.js – Controller layer for the Courses Catalog page.
 *
 * MVC Role: Controller
 * Manages all filter/search/sort state for CoursesView.
 */

import { useState, useMemo } from 'react'
import { COURSES, FACULTIES } from '../models/coursesModel.js'

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
 *
 * TODO (Phase 2): Replace COURSES with GET /api/courses/catalog
 */
export function useCoursesController() {
  const [searchQuery,    setSearchQuery]    = useState('')
  const [activeFaculty,  setActiveFaculty]  = useState('all')
  const [activeYear,     setActiveYear]     = useState('All Years')
  const [activeSemester, setActiveSemester] = useState('All Semesters')
  const [viewMode,       setViewMode]       = useState('grid')

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
  }
}

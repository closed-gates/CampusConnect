/**
 * routineController.js – Controller layer for the Routine page.
 *
 * MVC Role: Controller
 * Manages all state and logic for course selection, conflict detection,
 * and schedule grid computation. Used by RoutineView.
 */

import { useState, useMemo } from 'react'
import { STATIC_COURSES, TIME_SLOTS, DAYS } from '../models/routineModel.js'

/* ── Pure helper functions (no side effects) ─────────────────── */

export function remainingSeats(c) { return c.totalSeats - c.booked }
export function isSoldOut(c)      { return remainingSeats(c) <= 0 }

/**
 * Extracts the time-slot string from a course's time field.
 * e.g. "SUN-TUE 08:00 AM–09:20 AM" → ["08:00 AM–09:20 AM"]
 */
export function courseToSlots(c) {
  const parts = c.time.split(' ')
  const timePart = parts.slice(-3).join(' ')
  const slot = TIME_SLOTS.find(s => s === timePart)
  return slot ? [slot] : []
}

/**
 * Extracts the day names from a course's time field.
 * e.g. "SUN-TUE 08:00 AM–09:20 AM" → ["Sunday", "Tuesday"]
 */
export function courseToDays(c) {
  const parts = c.time.split(' ')
  const dayStr = parts.slice(0, parts.length - 3).join('-').toUpperCase()
  const map = {
    SUN: 'Sunday', MON: 'Monday', TUE: 'Tuesday',
    WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday',
  }
  const result = new Set()
  Object.entries(map).forEach(([abbr, full]) => {
    if (dayStr.includes(abbr)) result.add(full)
  })
  return [...result]
}

/**
 * Detects time conflicts among a list of selected courses.
 * Returns a Set of course IDs that are in conflict.
 */
export function detectConflicts(selected) {
  const cells = {}
  const conflicts = new Set()
  selected.forEach(c => {
    const slots = courseToSlots(c)
    const days  = courseToDays(c)
    days.forEach(day => {
      slots.forEach(slot => {
        const key = `${day}|${slot}`
        if (cells[key]) { conflicts.add(c.id); conflicts.add(cells[key]) }
        else             { cells[key] = c.id }
      })
    })
  })
  return conflicts
}

/* ── Controller Hook ─────────────────────────────────────────── */

/**
 * useRoutineController
 * Manages all routine builder state and exposes handlers to RoutineView.
 *
 * TODO (Phase 2): Replace STATIC_COURSES with
 *   GET /api/courses/available?q=<search>
 *   POST /api/routine/save  (save selected routine)
 */
export function useRoutineController() {
  const [availSearch,  setAvailSearch]  = useState('')
  const [selSearch,    setSelSearch]    = useState('')
  const [selected,     setSelected]     = useState([])
  const [highlighted,  setHighlighted]  = useState(null)

  /* Derived: available courses with "isTaken" flag */
  const available = useMemo(() => {
    const selectedCodes = new Set(selected.map(s => s.code))
    const selectedIds   = new Set(selected.map(s => s.id))
    return STATIC_COURSES
      .filter(c => !selectedIds.has(c.id))
      .map(c => ({ ...c, isTaken: selectedCodes.has(c.code) }))
      .filter(c => {
        const q = availSearch.toLowerCase()
        return !q || c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.section.includes(q)
      })
  }, [selected, availSearch])

  /* Derived: filtered selected courses */
  const filteredSelected = useMemo(() =>
    selected.filter(c => {
      const q = selSearch.toLowerCase()
      return !q || c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.section.includes(q)
    }),
    [selected, selSearch]
  )

  const conflicts         = useMemo(() => detectConflicts(selected), [selected])
  const highlightedCourse = useMemo(() => STATIC_COURSES.find(c => c.id === highlighted), [highlighted])
  const isHighlightedSelected  = selected.some(c => c.id === highlighted)
  const isHighlightedAvailable = available.some(c => c.id === highlighted && !c.isTaken)
  const totalCredits      = selected.length * 3

  /* Derived: schedule grid map { "Day|Slot" → [course, ...] } */
  const scheduleGrid = useMemo(() => {
    const grid = {}
    selected.forEach(c => {
      courseToSlots(c).forEach(slot => {
        courseToDays(c).forEach(day => {
          const key = `${day}|${slot}`
          if (!grid[key]) grid[key] = []
          grid[key].push(c)
        })
      })
    })
    return grid
  }, [selected])

  /* Handlers */
  const addCourse    = (c) => { setSelected(prev => [...prev, c]); setHighlighted(c.id) }
  const removeCourse = (c) => { setSelected(prev => prev.filter(s => s.id !== c.id)); setHighlighted(null) }
  const removeAll    = ()  => { setSelected([]); setHighlighted(null) }

  const handleAddHighlighted = () => {
    if (highlighted && isHighlightedAvailable) {
      const c = available.find(x => x.id === highlighted)
      if (c) addCourse(c)
    }
  }

  const handleRemoveHighlighted = () => {
    if (highlighted && isHighlightedSelected) {
      const c = selected.find(x => x.id === highlighted)
      if (c) removeCourse(c)
    }
  }

  const handleDownload = () => {
    alert('Download feature will be available in Phase 2 with database integration.')
  }

  return {
    // State
    availSearch, setAvailSearch,
    selSearch,   setSelSearch,
    highlighted, setHighlighted,
    selected,
    // Derived
    available,
    filteredSelected,
    conflicts,
    highlightedCourse,
    isHighlightedSelected,
    isHighlightedAvailable,
    totalCredits,
    scheduleGrid,
    // Static data (passed through for the View)
    TIME_SLOTS,
    DAYS,
    // Handlers
    addCourse,
    removeCourse,
    removeAll,
    handleAddHighlighted,
    handleRemoveHighlighted,
    handleDownload,
  }
}

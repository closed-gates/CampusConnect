/**
 * routineController.js – Controller layer for the Routine Builder page.
 *
 * MVC Role: Controller
 *
 * Manages all state and logic for course section selection, conflict detection,
 * and schedule grid computation.
 * Fetches real BRACU sections AND catalog from Neon DB so all 43 courses appear,
 * with section-specific time/room data where available.
 */

import { useState, useMemo, useEffect, useCallback } from 'react'
import { TIME_SLOTS, DAYS } from '../models/routineModel.js'
import { courseService } from '../services/courseService.js'
import { formatExamDate } from '../models/examScheduleModel.js'

/* ── Pure helper functions (no side effects) ─────────────────── */

export function remainingSeats(c) { return c.totalSeats - c.booked }
export function isSoldOut(c)      { return remainingSeats(c) <= 0 }

/**
 * Extracts the time-slot string from a course's time field.
 * Handles two formats:
 *   Old (static): "SUN-TUE 08:00 AM-09:20 AM"
 *   New (BRACU):  "SATURDAY(8:00 AM-9:20 AM-07A-05C) ; THURSDAY(8:00 AM-9:20 AM-07A-05C)"
 * Returns the first time slot found.
 */
export function courseToSlots(c) {
  if (!c.time) return []

  // New BRACU format: DAY(TIME-ROOM) ; DAY(TIME-ROOM)
  const bracuMatch = c.time.match(/\((\d+:\d+\s*[AP]M-\d+:\d+\s*[AP]M)/)
  if (bracuMatch) {
    // Normalise to "H:MM AM-H:MM PM" → find closest TIME_SLOTS entry
    const rawSlot = bracuMatch[1].replace('-', '-') // already has both times
    const slot = TIME_SLOTS.find(s => {
      // strip leading 0 for comparison (BRACU uses 8:00, we may store 08:00)
      const normalised = s.replace(/^0/, '')
      return rawSlot.startsWith(normalised.split('-')[0].replace(/^0/, ''))
    })
    return slot ? [slot] : [rawSlot]
  }

  // Old format: "SUN-TUE 08:00 AM-09:20 AM"
  const parts = c.time.split(' ')
  const timePart = parts.slice(1).join(' ')
  const slot = TIME_SLOTS.find(s => s === timePart)
  return slot ? [slot] : []
}

/**
 * Extracts the day names from a course's time field.
 * Handles both old and new BRACU formats.
 * e.g. "SATURDAY(8:00 AM-9:20 AM-07A-05C) ; THURSDAY(8:00 AM-9:20 AM-07A-05C)"
 *   → ["Saturday", "Thursday"]
 */
export function courseToDays(c) {
  if (!c.time) return []

  const map = {
    SUN: 'Sunday', MON: 'Monday', TUE: 'Tuesday',
    WED: 'Wednesday', THU: 'Thursday', FRI: 'Friday', SAT: 'Saturday',
    SUNDAY: 'Sunday', MONDAY: 'Monday', TUESDAY: 'Tuesday',
    WEDNESDAY: 'Wednesday', THURSDAY: 'Thursday', FRIDAY: 'Friday', SATURDAY: 'Saturday',
  }

  const result = new Set()

  // New BRACU format: extract day names before '('
  if (c.time.includes('(')) {
    const segments = c.time.split(';')
    segments.forEach(seg => {
      const dayPart = seg.trim().split('(')[0].trim().toUpperCase()
      if (map[dayPart]) result.add(map[dayPart])
    })
    return [...result]
  }

  // Old format: "SUN-TUE 08:00 AM–09:20 AM"
  const dayStr = c.time.split(' ')[0].toUpperCase()
  Object.entries(map).forEach(([abbr, full]) => {
    if (abbr.length <= 3 && dayStr.includes(abbr)) result.add(full)
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

/**
 * Sorts courses by course code, and by section number in ascending numerical order.
 * e.g. CSE110-01, CSE110-02, ..., CSE110-10, CSE111-01, ...
 */
export function sortCoursesByCodeAndSection(a, b) {
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

/* ── Normaliser: maps DB fields to frontend shape ────────────── */
/**
 * Merges live exam dates from examScheduleMap into a section or catalog entry.
 * Works for both CourseSection (has time/room/seats) and catalog-only entries.
 */
function normaliseSection(s, examScheduleMap) {
  const schedule = examScheduleMap ? examScheduleMap[s.code] : null
  return {
    ...s,
    totalSeats: Number(s.totalSeats || 0),
    booked:     Number(s.booked     || 0),
    // Overwrite examDay with DB-sourced final exam date (formatted string)
    examDay:    schedule ? formatExamDate(schedule.finalDate)   : (s.examDay && s.examDay !== 'TBA' ? s.examDay : 'TBA'),
    // Add midtermDay for display in CourseInfoBlock
    midtermDay: schedule ? formatExamDate(schedule.midtermDate) : (s.midtermExam && s.midtermExam !== 'TBA' ? s.midtermExam : null),
  }
}

/* ── Controller Hook ─────────────────────────────────────────── */

/**
 * useRoutineController
 * Fetches BRACU course sections from Neon DB and manages all
 * routine builder state.
 */
export function useRoutineController() {
  // ── Remote data state ─────────────────────────────────────────
  const [allSections,     setAllSections]     = useState([])
  const [examScheduleMap, setExamScheduleMap] = useState({})
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState(null)

  // ── UI state ──────────────────────────────────────────────────
  const [availSearch,  setAvailSearch]  = useState('')
  const [selSearch,    setSelSearch]    = useState('')
  const [selected,     setSelected]     = useState([])
  const [highlighted,  setHighlighted]  = useState(null)

  // ── Fetch sections + catalog + exam schedules in parallel ─────
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    // Fetch everything in parallel:
    //   - sections:       CourseSection rows with real time/room/seat data
    //   - catalogItems:   All 43 catalog courses (virtual TBA entries for those without sections)
    //   - scheduleData:   All exam dates from exam_schedules table
    Promise.all([
      courseService.getSections(),
      courseService.getCatalogForRoutine().catch(() => []),   // graceful fallback
      courseService.getExamSchedules().catch(() => []),        // graceful fallback
    ])
      .then(([sectionsData, catalogData, scheduleData]) => {
        if (!cancelled) {
          // Build exam schedule map: courseCode → ExamScheduleDTO
          const scheduleMap = {}
          scheduleData.forEach(s => { scheduleMap[s.courseCode] = s })
          setExamScheduleMap(scheduleMap)

          // Build set of course codes that already have real sections
          const codesWithSections = new Set(sectionsData.map(s => s.code))

          // Merge: keep all real sections + catalog entries for courses without sections
          const catalogOnly = catalogData.filter(c => !codesWithSections.has(c.code))
          const merged = [
            ...sectionsData.map(s => normaliseSection(s, scheduleMap)),
            ...catalogOnly.map(c => normaliseSection(c, scheduleMap)),
          ].sort(sortCoursesByCodeAndSection)

          setAllSections(merged)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('[RoutineController] Failed to fetch data:', err)
          setError('Could not load courses. Please check the backend is running.')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [])

  /* Derived: available sections with isTaken flag, sorted strictly section-number wise */
  const available = useMemo(() => {
    const selectedCodes = new Set(selected.map(s => s.code))
    const selectedIds   = new Set(selected.map(s => s.id))
    return allSections
      .filter(c => !selectedIds.has(c.id))
      .map(c => ({ ...c, isTaken: selectedCodes.has(c.code) }))
      .filter(c => {
        const q = availSearch.toLowerCase()
        return !q ||
          c.code.toLowerCase().includes(q)    ||
          c.title.toLowerCase().includes(q)   ||
          c.section.includes(q)
      })
      .sort(sortCoursesByCodeAndSection)
  }, [allSections, selected, availSearch])

  /* Derived: filtered selected courses */
  const filteredSelected = useMemo(() =>
    selected.filter(c => {
      const q = selSearch.toLowerCase()
      return !q ||
        c.code.toLowerCase().includes(q)  ||
        c.title.toLowerCase().includes(q) ||
        c.section.includes(q)
    }),
    [selected, selSearch]
  )

  const conflicts             = useMemo(() => detectConflicts(selected), [selected])
  const highlightedCourse     = useMemo(() => allSections.find(c => c.id === highlighted), [allSections, highlighted])
  const isHighlightedSelected  = selected.some(c => c.id === highlighted)
  const isHighlightedAvailable = available.some(c => c.id === highlighted && !c.isTaken)
  const totalCredits = selected.reduce((sum, c) => sum + Number(c.credits || 3), 0)

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
    alert('Download routine as PDF will be available in the next release.')
  }

  return {
    // Remote state
    loading, error,
    // State
    availSearch, setAvailSearch,
    selSearch,   setSelSearch,
    highlighted, setHighlighted,
    selected,
    // Derived
    available, filteredSelected, conflicts,
    highlightedCourse, isHighlightedSelected, isHighlightedAvailable,
    totalCredits, scheduleGrid,
    // Static data (passed through for the View)
    TIME_SLOTS, DAYS,
    // Handlers
    addCourse, removeCourse, removeAll,
    handleAddHighlighted, handleRemoveHighlighted, handleDownload,
  }
}

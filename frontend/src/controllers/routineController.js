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
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

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

  const handleDownload = useCallback(() => {
    if (selected.length === 0) return

    ;(() => {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

        // ── Palette ────────────────────────────────────────────────
        const BRAND_TEAL   = [13, 148, 136]   // #0D9488
        const HEADER_BG    = [240, 253, 250]   // #F0FDFA
        const BORDER_COLOR = [209, 213, 219]   // #D1D5DB
        const TEXT_DARK    = [17, 24, 39]      // #111827
        const TEXT_SUB     = [107, 114, 128]   // #6B7280

        // Course accent colours (cycle through a set)
        const ACCENT_COLORS = [
          [13, 148, 136],  // teal
          [99, 102, 241],  // indigo
          [245, 158, 11],  // amber
          [239, 68, 68],   // red
          [34, 197, 94],   // green
          [168, 85, 247],  // purple
          [20, 184, 166],  // cyan
          [249, 115, 22],  // orange
        ]
        // Assign a stable colour to each selected course
        const courseColorMap = {}
        selected.forEach((c, i) => {
          courseColorMap[c.id] = ACCENT_COLORS[i % ACCENT_COLORS.length]
        })

        const pageW = doc.internal.pageSize.getWidth()   // 297 for A4 landscape
        const margin = 12

        // ── Title ──────────────────────────────────────────────────
        doc.setFillColor(...BRAND_TEAL)
        doc.rect(0, 0, pageW, 18, 'F')
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('CampusConnect – My Routine', margin, 12)

        const now = new Date()
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
        doc.text(`Generated: ${dateStr}  ·  ${selected.length} course${selected.length !== 1 ? 's' : ''}  ·  ${selected.reduce((s, c) => s + Number(c.credits || 3), 0)} credits`, pageW - margin, 12, { align: 'right' })

        // ── Weekly Schedule Grid ───────────────────────────────────
        const gridTop = 24
        doc.setTextColor(...TEXT_DARK)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('Weekly Schedule', margin, gridTop - 2)

        // Build table body
        const colWidth = (pageW - 2 * margin - 28) / DAYS.length  // 28mm for time column
        const head = [['Time', ...DAYS]]
        const body = TIME_SLOTS.map(slot => {
          const row = [slot]
          DAYS.forEach(day => {
            const key = `${day}|${slot}`
            const cellCourses = scheduleGrid[key] || []
            row.push(cellCourses.map(c => `${c.code}-${String(c.section).padStart(2,'0')}\n${c.room || ''}`).join('\n') || '')
          })
          return row
        })

        // Draw the timetable using autoTable
        doc.autoTable({
          head,
          body,
          startY: gridTop,
          margin: { left: margin, right: margin },
          tableWidth: pageW - 2 * margin,
          styles: {
            fontSize: 7,
            cellPadding: 2,
            textColor: TEXT_DARK,
            lineColor: BORDER_COLOR,
            lineWidth: 0.2,
            valign: 'middle',
            halign: 'center',
          },
          headStyles: {
            fillColor: BRAND_TEAL,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 8,
          },
          columnStyles: {
            0: { cellWidth: 28, halign: 'left', fontStyle: 'bold', fillColor: HEADER_BG, textColor: TEXT_SUB, fontSize: 7 },
          },
          // Colour cells that have courses
          didDrawCell: (data) => {
            if (data.section !== 'body' || data.column.index === 0) return
            const day  = DAYS[data.column.index - 1]
            const slot = TIME_SLOTS[data.row.index]
            const key  = `${day}|${slot}`
            const cellCourses = scheduleGrid[key] || []
            if (cellCourses.length === 0) return

            const c     = cellCourses[0]
            const color = courseColorMap[c.id] || BRAND_TEAL
            const { x, y, width, height } = data.cell
            // Draw a tinted background
            doc.setFillColor(color[0], color[1], color[2])
            doc.setGState(new doc.GState({ opacity: 0.15 }))
            doc.rect(x, y, width, height, 'F')
            doc.setGState(new doc.GState({ opacity: 1 }))
            // Draw a left accent bar
            doc.setFillColor(color[0], color[1], color[2])
            doc.rect(x, y, 1.5, height, 'F')
          },
          willDrawCell: (data) => {
            if (data.section === 'body' && data.column.index > 0) {
              const day  = DAYS[data.column.index - 1]
              const slot = TIME_SLOTS[data.row.index]
              const key  = `${day}|${slot}`
              const cellCourses = scheduleGrid[key] || []
              if (cellCourses.length > 0) {
                const c = cellCourses[0]
                const color = courseColorMap[c.id] || BRAND_TEAL
                data.cell.styles.textColor = color
                data.cell.styles.fontStyle = 'bold'
              }
            }
          },
        })

        // ── Course List Table ──────────────────────────────────────
        const afterGrid = doc.lastAutoTable.finalY + 8

        doc.setTextColor(...TEXT_DARK)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text('Selected Courses', margin, afterGrid - 2)

        const courseRows = selected.map((c, i) => [
          i + 1,
          c.code,
          c.title,
          `Sec-${String(c.section).padStart(2,'0')}`,
          c.faculty || '–',
          c.time    || 'TBA',
          c.room    || '–',
          String(c.credits || 3),
          conflicts.has(c.id) ? '⚠ Conflict' : '✓ OK',
        ])

        doc.autoTable({
          head: [['#', 'Code', 'Title', 'Section', 'Faculty', 'Time', 'Room', 'Cr.', 'Status']],
          body: courseRows,
          startY: afterGrid,
          margin: { left: margin, right: margin },
          styles: {
            fontSize: 7,
            cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
            textColor: TEXT_DARK,
            lineColor: BORDER_COLOR,
            lineWidth: 0.2,
          },
          headStyles: {
            fillColor: BRAND_TEAL,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 7.5,
          },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          columnStyles: {
            0: { cellWidth: 8,  halign: 'center' },
            1: { cellWidth: 22, fontStyle: 'bold' },
            2: { cellWidth: 55 },
            3: { cellWidth: 18, halign: 'center' },
            4: { cellWidth: 40 },
            5: { cellWidth: 40 },
            6: { cellWidth: 18 },
            7: { cellWidth: 10, halign: 'center' },
            8: { cellWidth: 20, halign: 'center' },
          },
          // Colour the # cell with the course accent
          didDrawCell: (data) => {
            if (data.section !== 'body' || data.column.index !== 0) return
            const c     = selected[data.row.index]
            const color = courseColorMap[c?.id] || BRAND_TEAL
            const { x, y, width, height } = data.cell
            doc.setFillColor(color[0], color[1], color[2])
            doc.setGState(new doc.GState({ opacity: 0.25 }))
            doc.rect(x, y, width, height, 'F')
            doc.setGState(new doc.GState({ opacity: 1 }))
          },
          didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 8) {
              const row = data.row.raw
              data.cell.styles.textColor = row[8].startsWith('⚠') ? [220, 38, 38] : [4, 120, 87]
              data.cell.styles.fontStyle = 'bold'
            }
          },
        })

        // ── Footer ─────────────────────────────────────────────────
        const footerY = doc.internal.pageSize.getHeight() - 6
        doc.setFontSize(7)
        doc.setTextColor(...TEXT_SUB)
        doc.setFont('helvetica', 'normal')
        doc.text('CampusConnect · Routine Builder', margin, footerY)
        doc.text(`Total Credits: ${selected.reduce((s, c) => s + Number(c.credits || 3), 0)}`, pageW / 2, footerY, { align: 'center' })
        doc.text(`Page 1`, pageW - margin, footerY, { align: 'right' })

        // ── Save ───────────────────────────────────────────────────
        const safeName = `routine_${now.toISOString().slice(0,10)}.pdf`
        doc.save(safeName)
    })()
  }, [selected, scheduleGrid, conflicts])

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

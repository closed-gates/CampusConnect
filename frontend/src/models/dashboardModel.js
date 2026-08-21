/**
 * dashboardModel.js – Model layer for the Dashboard page.
 *
 * MVC Role: Model
 * Defines schemas, stat card shapes, and timetable calculation helpers.
 *
 * Supports both official BRACU schedule format:
 *   "SATURDAY(8:00 AM-9:20 AM-07A-05C) ; THURSDAY(8:00 AM-9:20 AM-07A-05C)"
 * and legacy schedule format:
 *   "SUN-TUE 08:00 AM-09:20 AM"
 */

export const ROUTINE_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export const ROUTINE_TIME_SLOTS = [
  '8:00 AM-9:20 AM',
  '9:30 AM-10:50 AM',
  '11:00 AM-12:20 PM',
  '12:30 PM-1:50 PM',
  '2:00 PM-3:20 PM',
  '3:30 PM-4:50 PM',
  '5:00 PM-6:20 PM',
]

/**
 * Normalises a time slot string into one of the standard ROUTINE_TIME_SLOTS.
 * e.g. "08:00 AM-09:20 AM" → "8:00 AM-9:20 AM"
 *      "2:00 PM-3:20 PM"   → "2:00 PM-3:20 PM"
 *      "02:00 PM-03:20 PM" → "2:00 PM-3:20 PM"
 *      "12:30 PM-01:50 PM" → "12:30 PM-1:50 PM"
 */
export function normaliseSlot(slotStr) {
  if (!slotStr) return null
  const cleaned = slotStr.replace(/[–—]/g, '-').trim()

  // Exact match
  const exact = ROUTINE_TIME_SLOTS.find(s => s.toLowerCase() === cleaned.toLowerCase())
  if (exact) return exact

  // Compare start times without leading zero (e.g. "08:00" vs "8:00", "02:00" vs "2:00")
  const startRaw = cleaned.split('-')[0].trim().replace(/^0/, '')
  const match = ROUTINE_TIME_SLOTS.find(s => s.replace(/^0/, '').startsWith(startRaw))
  if (match) return match

  return cleaned
}

/**
 * Parses all day + time + room occurrences from a schedule string.
 * Returns array of { day: string, slot: string, room?: string }
 */
export function parseScheduleSegments(timeString) {
  if (!timeString || typeof timeString !== 'string' || timeString.trim() === '' || timeString.trim() === 'TBA') {
    return []
  }

  const dayMap = {
    SUN: 'Sunday', SUNDAY: 'Sunday',
    MON: 'Monday', MONDAY: 'Monday',
    TUE: 'Tuesday', TUESDAY: 'Tuesday',
    WED: 'Wednesday', WEDNESDAY: 'Wednesday',
    THU: 'Thursday', THURSDAY: 'Thursday',
    FRI: 'Friday', FRIDAY: 'Friday',
    SAT: 'Saturday', SATURDAY: 'Saturday',
  }

  const segments = []

  // Case 1: BRACU format: "DAY(START-END-ROOM) ; DAY(START-END-ROOM)"
  if (timeString.includes('(')) {
    const parts = timeString.split(';')
    for (const part of parts) {
      const trimmed = part.trim()
      const match = trimmed.match(/^([A-Za-z]+)\s*\((.*?)\)$/)
      if (match) {
        const dayKey = match[1].toUpperCase()
        const day = dayMap[dayKey] || match[1]
        const inner = match[2] // e.g. "11:00 AM-12:20 PM-10A-05C"

        // Extract time range (e.g. "11:00 AM-12:20 PM")
        const timeMatch = inner.match(/(\d+:\d+\s*[AP]M\s*[-–]\s*\d+:\d+\s*[AP]M)/i)
        const rawTime = timeMatch ? timeMatch[1] : inner
        const slot = normaliseSlot(rawTime)

        // Extract room if present (everything after time range)
        let room = ''
        if (timeMatch) {
          const afterTime = inner.substring(inner.indexOf(timeMatch[0]) + timeMatch[0].length).replace(/^[-–\s]+/, '')
          if (afterTime) room = afterTime
        }

        if (day && slot) {
          segments.push({ day, slot, room })
        }
      }
    }
    if (segments.length > 0) return segments
  }

  // Case 2: Legacy format: "SUN-TUE 08:00 AM-09:20 AM"
  const parts = timeString.trim().split(' ')
  const dayPrefix = parts[0].toUpperCase()
  const rawSlot = parts.slice(1).join(' ')
  const slot = normaliseSlot(rawSlot)

  Object.entries(dayMap).forEach(([abbr, full]) => {
    if (abbr.length <= 3 && dayPrefix.includes(abbr)) {
      segments.push({ day: full, slot: slot || rawSlot })
    }
  })

  return segments
}

/**
 * Extracts day names from a course section time field (backward compatibility).
 *
 * @param {string} timeString
 * @returns {string[]}
 */
export function parseDaysFromTimeString(timeString) {
  const segments = parseScheduleSegments(timeString)
  return [...new Set(segments.map(s => s.day))]
}

/**
 * Extracts slot string from a course section time field (backward compatibility).
 *
 * @param {string} timeString
 * @returns {string}
 */
export function parseSlotFromTimeString(timeString) {
  const segments = parseScheduleSegments(timeString)
  return segments.length > 0 ? segments[0].slot : 'TBA'
}

/**
 * Calculates total number of class sessions per week from a list of sections.
 *
 * @param {Array} sections
 * @returns {number}
 */
export function calculateWeeklyClassCount(sections) {
  if (!Array.isArray(sections) || sections.length === 0) return 0
  let total = 0
  sections.forEach(sec => {
    const segments = parseScheduleSegments(sec.time)
    total += segments.length > 0 ? segments.length : 2 // Default to 2 sessions/week if TBA
  })
  return total
}

/**
 * Builds a timetable schedule grid matrix { "Day|Slot": [section, ...] }
 *
 * @param {Array} sections
 * @returns {Object}
 */
export function buildRoutineGrid(sections) {
  const grid = {}
  if (!Array.isArray(sections)) return grid

  sections.forEach(sec => {
    const segments = parseScheduleSegments(sec.time)
    segments.forEach(({ day, slot, room }) => {
      const key = `${day}|${slot}`
      if (!grid[key]) grid[key] = []
      grid[key].push({
        ...sec,
        room: room || sec.room || 'TBA',
      })
    })
  })

  return grid
}

/**
 * Default initial stat cards structure
 */
export const DEFAULT_DASHBOARD_STATS = [
  {
    id: 'enrolled',
    icon: '🎓',
    iconColor: 'teal',
    value: '...',
    label: 'Enrolled Courses',
    linkText: 'View details',
    isActive: true,
  },
  {
    id: 'routine',
    icon: '📅',
    iconColor: 'purple',
    value: '...',
    label: 'Classes This Week (Routine)',
    linkText: 'View schedule',
    isActive: false,
  },
  {
    id: 'attendance',
    icon: '✅',
    iconColor: 'orange',
    value: '...',
    label: 'Attendance Metrics',
    linkText: 'View report',
    isActive: false,
  },
]

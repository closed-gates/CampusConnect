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
 * Normalises a time slot string into standard format.
 * e.g. "08:00 AM-09:20 AM" → "8:00 AM-9:20 AM"
 *      "2:00 PM-3:20 PM"   → "2:00 PM-3:20 PM"
 *      "08:00 AM - 10:50 AM" → "8:00 AM-10:50 AM"
 */
export function normaliseSlot(slotStr) {
  if (!slotStr) return null
  const cleaned = slotStr.replace(/[–—]/g, '-').trim()

  // Match H:MM AM - H:MM PM
  const m = cleaned.match(/(\d{1,2}):(\d{2})\s*([AP]M)\s*-\s*(\d{1,2}):(\d{2})\s*([AP]M)/i)
  if (m) {
    const startH = parseInt(m[1], 10)
    const startM = m[2]
    const startP = m[3].toUpperCase()
    const endH = parseInt(m[4], 10)
    const endM = m[5]
    const endP = m[6].toUpperCase()
    return `${startH}:${startM} ${startP}-${endH}:${endM} ${endP}`
  }

  // Exact match
  const exact = ROUTINE_TIME_SLOTS.find(s => s.toLowerCase() === cleaned.toLowerCase())
  if (exact) return exact

  return cleaned
}

/**
 * Sorts time slots chronologically from morning to evening.
 */
export function sortTimeSlots(slots) {
  const parseTime = (str) => {
    if (!str) return 0
    const m = str.match(/(\d{1,2}):(\d{2})\s*([AP]M)/i)
    if (!m) return 0
    let h = parseInt(m[1], 10)
    const min = parseInt(m[2], 10)
    const ampm = m[3].toUpperCase()
    if (ampm === 'PM' && h !== 12) h += 12
    if (ampm === 'AM' && h === 12) h = 0
    return h * 60 + min
  }

  return [...slots].sort((a, b) => {
    const diff = parseTime(a) - parseTime(b)
    if (diff !== 0) return diff
    const endA = a.split('-')[1] || ''
    const endB = b.split('-')[1] || ''
    return parseTime(endA) - parseTime(endB)
  })
}

/**
 * Parses all day + time + room occurrences from a schedule string.
 * Supports:
 *   - BRACU format: "MONDAY(3:30 PM-4:50 PM-MON 3:30PM: 09G-31T; WED 3:30PM: 07A-07C) ; WEDNESDAY(3:30 PM-4:50 PM-...)"
 *   - Standard BRACU format: "SATURDAY(8:00 AM-9:20 AM-07A-05C) ; THURSDAY(8:00 AM-9:20 AM-07A-05C)"
 *   - Legacy format: "SUN-TUE 08:00 AM-09:20 AM"
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
  // Matches each day group with parentheses safely (even if inner content has semicolons)
  if (timeString.includes('(')) {
    const regex = /([A-Za-z]+)\s*\(([\s\S]*?)\)/g
    let match
    while ((match = regex.exec(timeString)) !== null) {
      const dayKey = match[1].toUpperCase()
      const day = dayMap[dayKey] || dayMap[dayKey.substring(0, 3)] || match[1]
      const inner = match[2].trim()

      // Extract time range (e.g. "3:30 PM-4:50 PM")
      const timeMatch = inner.match(/(\d{1,2}:\d{2}\s*[AP]M\s*[-–]\s*\d{1,2}:\d{2}\s*[AP]M)/i)
      const rawTime = timeMatch ? timeMatch[1] : inner
      const slot = normaliseSlot(rawTime)

      // Extract room for this specific day
      let room = ''
      if (timeMatch) {
        const afterTime = inner.substring(inner.indexOf(timeMatch[0]) + timeMatch[0].length).replace(/^[-–\s]+/, '')
        if (afterTime) {
          const dayAbbr = dayKey.substring(0, 3)
          if (afterTime.includes(';')) {
            const parts = afterTime.split(';')
            for (const part of parts) {
              if (part.toUpperCase().includes(dayAbbr)) {
                const tokens = part.split(':')
                room = tokens[tokens.length - 1].trim()
                break
              }
            }
            if (!room && parts.length > 0) {
              room = parts[0].split(':').pop().trim()
            }
          } else if (afterTime.toUpperCase().includes(dayAbbr) && afterTime.includes(':')) {
            const tokens = afterTime.split(':')
            room = tokens[tokens.length - 1].trim()
          } else {
            room = afterTime.trim()
          }
        }
      }

      if (day && slot) {
        segments.push({ day, slot, room })
      }
    }
    if (segments.length > 0) return segments
  }

  // Case 2: Legacy format: "SUN-TUE 08:00 AM-09:20 AM"
  const timeMatch = timeString.match(/(\d{1,2}:\d{2}\s*[AP]M\s*[-–]\s*\d{1,2}:\d{2}\s*[AP]M)/i)
  if (timeMatch) {
    const rawSlot = timeMatch[1]
    const slot = normaliseSlot(rawSlot)
    const upper = timeString.toUpperCase()
    Object.entries(dayMap).forEach(([abbr, full]) => {
      if (abbr.length === 3 && upper.includes(abbr)) {
        segments.push({ day: full, slot: slot || rawSlot })
      }
    })
    if (segments.length > 0) return segments
  }

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
        code: sec.code || sec.courseCode || '',
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

/**
 * dashboardModel.js – Model layer for the Dashboard page.
 *
 * MVC Role: Model
 * Defines schemas, stat card shapes, and timetable calculation helpers.
 */

export const ROUTINE_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday']

export const ROUTINE_TIME_SLOTS = [
  '08:00 AM-09:20 AM',
  '09:30 AM-10:50 AM',
  '11:00 AM-12:20 PM',
  '12:30 PM-01:50 PM',
  '02:00 PM-03:20 PM',
  '03:30 PM-04:50 PM',
  '05:00 PM-06:20 PM',
]

/**
 * Extracts day names from a course section time field.
 * e.g. "SUN-TUE 08:00 AM-09:20 AM" → ["Sunday", "Tuesday"]
 *
 * @param {string} timeString
 * @returns {string[]}
 */
export function parseDaysFromTimeString(timeString) {
  if (!timeString || typeof timeString !== 'string') return []
  const parts = timeString.trim().split(' ')
  const dayPrefix = parts[0].toUpperCase()

  const dayMap = {
    SUN: 'Sunday',
    MON: 'Monday',
    TUE: 'Tuesday',
    WED: 'Wednesday',
    THU: 'Thursday',
    FRI: 'Friday',
    SAT: 'Saturday',
  }

  const days = []
  Object.entries(dayMap).forEach(([abbr, full]) => {
    if (dayPrefix.includes(abbr)) {
      days.push(full)
    }
  })
  return days
}

/**
 * Extracts slot string from a course section time field.
 * e.g. "SUN-TUE 08:00 AM-09:20 AM" → "08:00 AM-09:20 AM"
 *
 * @param {string} timeString
 * @returns {string}
 */
export function parseSlotFromTimeString(timeString) {
  if (!timeString || typeof timeString !== 'string') return 'TBA'
  const parts = timeString.trim().split(' ')
  if (parts.length < 2) return 'TBA'
  return parts.slice(1).join(' ')
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
    const days = parseDaysFromTimeString(sec.time)
    total += (days.length > 0 ? days.length : 2) // Default to 2 sessions/week if TBA
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
    const days = parseDaysFromTimeString(sec.time)
    const slot = parseSlotFromTimeString(sec.time)

    days.forEach(day => {
      const key = `${day}|${slot}`
      if (!grid[key]) grid[key] = []
      grid[key].push(sec)
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

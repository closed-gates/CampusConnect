/**
 * viewRoutineModel.js – Model layer for Student "View Routine" PDF/Document structure.
 *
 * MVC Role: Model
 * Pure JS definitions for routine grid days, time slots, schedule parsers, and exam schedule generators.
 */

export const DAYS_OF_WEEK = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY'
]

export const STANDARD_TIME_SLOTS = [
  '8:00 am - 9:20 am',
  '8:00 am - 10:50 am',
  '11:00 am - 12:20 pm',
  '11:00 am - 1:50 pm',
  '12:30 pm - 1:50 pm',
  '2:00 pm - 3:20 pm',
  '2:00 pm - 4:50 pm',
  '3:30 pm - 4:50 pm',
  '5:00 pm - 6:20 pm',
]

/**
 * Normalizes time string to standard format: "h:mm am - h:mm pm"
 */
export function normalizeTimeSlot(raw) {
  if (!raw) return ''
  let s = raw.toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/–/g, '-')
    .replace(/\s*-\s*/g, ' - ')
    .trim()

  // Ensure am/pm spacing is standard (e.g., "8:00 am - 9:20 am")
  s = s.replace(/(\d{1,2}:\d{2})\s*([ap]m)/g, '$1 $2')
  return s
}

/**
 * Parses course schedules into cell assignments:
 * Returns map: { "DAY_NAME": { "NORMALIZED_TIMESLOT": [ { courseCode, section, faculty, room } ] } }
 */
export function buildRoutineMatrix(courses = []) {
  const matrix = {}
  DAYS_OF_WEEK.forEach(day => {
    matrix[day] = {}
  })

  courses.forEach(course => {
    const rawTime = course.time || course.schedule || ''
    const code = course.courseCode || course.code || ''
    const section = course.section || '01'
    const faculty = course.faculty || 'TBA'
    const defaultRoom = course.room || 'TBA'

    if (!rawTime) return

    // Format A: "SUNDAY(8:00 AM-9:20 AM-09C-16T) ; TUESDAY(8:00 AM-9:20 AM-09C-16T)"
    if (rawTime.includes('(') && rawTime.includes(')')) {
      const parts = rawTime.split(';')
      parts.forEach(part => {
        const trimmed = part.trim()
        const parenStart = trimmed.indexOf('(')
        const parenEnd = trimmed.lastIndexOf(')')
        if (parenStart > 0 && parenEnd > parenStart) {
          const rawDay = trimmed.substring(0, parenStart).trim().toUpperCase()
          const matchedDay = DAYS_OF_WEEK.find(d => rawDay.includes(d))

          if (matchedDay) {
            const inner = trimmed.substring(parenStart + 1, parenEnd)
            // inner format: "8:00 AM-9:20 AM-09C-16T" or "8:00 AM-9:20 AM"
            const segments = inner.split('-')
            let timeStr = ''
            let roomStr = defaultRoom

            if (segments.length >= 3) {
              // segments: ["8:00 AM", "9:20 AM", "09C", "16T"]
              timeStr = `${segments[0].trim()} - ${segments[1].trim()}`
              roomStr = segments.slice(2).join('-').trim()
            } else if (segments.length === 2) {
              timeStr = `${segments[0].trim()} - ${segments[1].trim()}`
            } else {
              timeStr = inner
            }

            const normSlot = normalizeTimeSlot(timeStr)
            if (!matrix[matchedDay][normSlot]) {
              matrix[matchedDay][normSlot] = []
            }
            matrix[matchedDay][normSlot].push({
              code,
              section,
              faculty,
              room: roomStr || defaultRoom
            })
          }
        }
      })
    }
    // Format B: "SUN-TUE 08:00 AM-09:20 AM" or "MW 11:00 AM-12:20 PM"
    else {
      const dayTokens = [
        { key: 'SUN', day: 'SUNDAY' },
        { key: 'MON', day: 'MONDAY' },
        { key: 'TUE', day: 'TUESDAY' },
        { key: 'WED', day: 'WEDNESDAY' },
        { key: 'THU', day: 'THURSDAY' },
        { key: 'FRI', day: 'FRIDAY' },
        { key: 'SAT', day: 'SATURDAY' }
      ]

      const upper = rawTime.toUpperCase()
      const targetDays = dayTokens.filter(t => upper.includes(t.key)).map(t => t.day)

      // Extract time portion (everything after the day abbreviations)
      const timeMatch = rawTime.match(/\d{1,2}:\d{2}\s*[AP]M\s*[-–]\s*\d{1,2}:\d{2}\s*[AP]M/i)
      const slotStr = timeMatch ? normalizeTimeSlot(timeMatch[0]) : normalizeTimeSlot(rawTime)

      targetDays.forEach(day => {
        if (!matrix[day][slotStr]) {
          matrix[day][slotStr] = []
        }
        matrix[day][slotStr].push({
          code,
          section,
          faculty,
          room: defaultRoom
        })
      })
    }
  })

  return matrix
}

/**
 * Derives dynamic Midterm & Final Exam Schedules for enrolled courses.
 */
export function generateExamSchedule(courses = []) {
  if (!courses || courses.length === 0) return []

  const midDates = [
    'SATURDAY (2026-11-21)',
    'SUNDAY (2026-11-22)',
    'MONDAY (2026-11-23)',
    'TUESDAY (2026-11-24)',
    'WEDNESDAY (2026-11-25)',
    'THURSDAY (2026-11-26)',
  ]

  const finalDates = [
    'THURSDAY (2027-01-07)',
    'SATURDAY (2027-01-09)',
    'SUNDAY (2027-01-10)',
    'MONDAY (2027-01-11)',
    'TUESDAY (2027-01-12)',
    'WEDNESDAY (2027-01-13)',
  ]

  const examTimes = [
    '9:00 am-11:00 am',
    '11:00 am-1:00 pm',
    '2:00 pm-4:00 pm',
    '3:30 pm-5:30 pm'
  ]

  const exams = []

  // Generate Midterm Exams
  courses.forEach((course, idx) => {
    const code = course.courseCode || course.code || 'COURSE'
    exams.push({
      id: `mid-${code}`,
      day: midDates[idx % midDates.length],
      time: examTimes[idx % examTimes.length],
      exam: 'MID',
      course: code
    })
  })

  // Generate Final Exams
  courses.forEach((course, idx) => {
    const code = course.courseCode || course.code || 'COURSE'
    exams.push({
      id: `final-${code}`,
      day: finalDates[idx % finalDates.length],
      time: examTimes[(idx + 1) % examTimes.length],
      exam: 'FINAL',
      course: code
    })
  })

  return exams
}

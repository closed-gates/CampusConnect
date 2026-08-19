/**
 * routineModel.js – Model layer for the Routine Builder page.
 *
 * MVC Role: Model
 * Contains schedule constants and time slot definitions.
 *
 * Schema v2: STATIC_COURSES removed — all 2,298 real BRACU sections are now
 * served from the backend via GET /api/courses/sections (seeded from
 * BRACU_All_2298_Sections.csv, Summer 2026).
 *
 * The Routine Builder controller (useRoutineController.js) should call
 * the API to load sections dynamically.
 *
 * Data source: BRACU_All_2298_Sections.csv (Official BRACU Summer 2026 Schedule)
 */

/**
 * STATIC_COURSES – Exported as empty array for backward compatibility.
 * Real sections are loaded via courseService.getSections().
 */
export const STATIC_COURSES = []

/**
 * TIME_SLOTS – BRACU's standard class time blocks.
 * These are the six standard 80-minute slots used Monday-Saturday at BRACU.
 */
export const TIME_SLOTS = [
  '8:00 AM-9:20 AM',
  '9:30 AM-10:50 AM',
  '11:00 AM-12:20 PM',
  '12:30 PM-1:50 PM',
  '2:00 PM-3:20 PM',
  '3:30 PM-4:50 PM',
  '5:00 PM-6:20 PM',
]

/**
 * DAYS – Full day names as used in BRACU schedule strings.
 * BRACU classes are held Sunday through Thursday (with some Saturday slots).
 */
export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/**
 * DAY_ABBREVIATIONS – Short labels for timetable display.
 */
export const DAY_ABBREVIATIONS = {
  Sunday: 'SUN',
  Monday: 'MON',
  Tuesday: 'TUE',
  Wednesday: 'WED',
  Thursday: 'THU',
  Friday: 'FRI',
  Saturday: 'SAT',
}

/**
 * ROUTINE_GRID_DAYS – Days shown in the routine grid view (Sun-Thu + Sat).
 */
export const ROUTINE_GRID_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday']

/**
 * Empty section shape – used as a template / initial state for new entries.
 * Mirrors the CourseSection JPA entity fields.
 */
export const EMPTY_SECTION = {
  id: '',
  code: '',
  section: '',
  title: '',
  faculty: '',
  time: '',
  room: '',
  examDay: '',
  totalSeats: 0,
  booked: 0,
  prerequisiteCodes: '',
  credits: 3.0,
  midtermExam: '',
}

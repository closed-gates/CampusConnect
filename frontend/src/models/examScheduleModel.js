/**
 * examScheduleModel.js – Model layer for the Exam Schedule feature.
 *
 * MVC Role: Model
 * Contains constants, initial state shapes, and configuration for
 * the Exam Schedule widget (dashboard) and Routine Builder integration.
 *
 * No JSX, no hooks, no side effects.
 */

/** Base URL for exam schedule API */
export const EXAM_SCHEDULE_API = 'http://localhost:8080/api/exam-schedule'

/**
 * Fallback student ID when no auth token / localStorage entry exists.
 * Matches the seeded demo student used across the project.
 */
export const FALLBACK_STUDENT_ID = 'STU001'

/** Empty state shape returned while loading or on error */
export const EMPTY_EXAM_SCHEDULE = []

/**
 * Configuration for each exam type:
 *   label       – display text
 *   colorVar    – CSS variable name for the accent colour
 *   urgentDays  – threshold below which the countdown turns urgent (red)
 *   warningDays – threshold below which the countdown shows amber
 */
export const EXAM_TYPE_CONFIG = {
  midterm: {
    label:       'Midterm',
    icon:        '📝',
    urgentDays:  10,
    warningDays: 21,
  },
  final: {
    label:       'Final Exam',
    icon:        '🎓',
    urgentDays:  14,
    warningDays: 30,
  },
}

/**
 * Returns the urgency class name for a days-left value.
 * @param {number} daysLeft
 * @param {'midterm'|'final'} type
 * @returns {'urgent'|'warning'|'safe'|'passed'}
 */
export function getUrgency(daysLeft, type) {
  if (daysLeft < 0)  return 'passed'
  const cfg = EXAM_TYPE_CONFIG[type]
  if (daysLeft <= cfg.urgentDays)  return 'urgent'
  if (daysLeft <= cfg.warningDays) return 'warning'
  return 'safe'
}

/**
 * Formats a LocalDateTime string from the API into a readable date.
 * Input:  "2026-12-10T09:00:00"
 * Output: "Dec 10, 2026 · 9:00 AM"
 *
 * @param {string} isoString
 * @returns {string}
 */
export function formatExamDate(isoString) {
  if (!isoString) return '—'
  try {
    const d = new Date(isoString)
    const date = d.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
    const time = d.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit', hour12: true,
    })
    return `${date} · ${time}`
  } catch {
    return isoString
  }
}

/**
 * Formats the days-left value into a human-readable label.
 * @param {number} daysLeft
 * @returns {string}
 */
export function formatDaysLeft(daysLeft) {
  if (daysLeft < 0)  return 'Passed'
  if (daysLeft === 0) return 'Today!'
  if (daysLeft === 1) return '1 day left'
  return `${daysLeft} days left`
}

/**
 * Given a course object from the API, determines which exams to show.
 *
 * Rules:
 *   - Exams with daysLeft < 0 are "passed" and filtered out entirely.
 *   - Of the remaining upcoming exams, the one with fewer daysLeft is "primary"
 *     (shown immediately); the other is "secondary" (behind a dropdown).
 *   - If both are passed, returns null (caller should hide the card).
 *   - If only one is upcoming, it is "primary" and secondary is null.
 *
 * @param {object} course  – API ExamScheduleDTO shape
 * @returns {{ primary: ExamEntry, secondary: ExamEntry|null } | null}
 *
 * ExamEntry shape: { type: 'midterm'|'final', dateIso: string, daysLeft: number }
 */
export function pickExams(course) {
  const candidates = [
    { type: 'midterm', dateIso: course.midtermDate, daysLeft: course.midtermDaysLeft },
    { type: 'final',   dateIso: course.finalDate,   daysLeft: course.finalDaysLeft   },
  ].filter(e => e.daysLeft >= 0)  // drop passed exams

  if (candidates.length === 0) return null   // both passed → hide card

  // Sort ascending by daysLeft → index 0 is the closest
  candidates.sort((a, b) => a.daysLeft - b.daysLeft)

  return {
    primary:   candidates[0],
    secondary: candidates[1] ?? null,
  }
}


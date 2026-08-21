import { useState } from 'react'
import './ExamScheduleWidget.css'
import { useExamScheduleController } from '../../controllers/examScheduleController.js'
import {
  EXAM_TYPE_CONFIG,
  getUrgency,
  formatExamDate,
  formatDaysLeft,
  pickExams,
} from '../../models/examScheduleModel.js'

/**
 * ExamScheduleWidget – View component for the dashboard exam countdown panel.
 *
 * MVC Role: View (Component)
 *
 * Shows the CLOSEST upcoming exam for each enrolled course with a colour-coded
 * countdown. If a further-away exam also exists, the user can reveal it via a
 * "Show [type]" dropdown toggle.
 *
 * Passed exams are hidden entirely. Courses where both exams have passed are
 * not rendered.
 *
 * All remote data is provided by useExamScheduleController().
 * Local UI state (dropdown open/close) lives in ExamCourseCard — it is
 * pure presentation toggle state, not business logic.
 */
export default function ExamScheduleWidget() {
  const { examSchedule, loading, error } = useExamScheduleController()

  // Filter out courses where both exams have passed (pickExams returns null)
  const visible = examSchedule.filter(c => pickExams(c) !== null)

  return (
    <div className="section-card">
      {/* ── Section Header ── */}
      <div className="section-header">
        <h2 className="section-title">📅 Upcoming Exams</h2>
        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-sub)' }}>
          Next exam · click to expand
        </span>
      </div>

      <div className="exam-schedule-widget">

        {/* Loading skeleton */}
        {loading && (
          <div className="exam-skeleton" aria-label="Loading exam schedule">
            {[1, 2, 3].map(i => (
              <div key={i} className="exam-skeleton-card">
                <div className="exam-skeleton-header" />
                <div className="exam-skeleton-row" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="exam-error-state" role="alert">
            ⚠️ {error}
          </div>
        )}

        {/* Empty state — no upcoming exams */}
        {!loading && !error && visible.length === 0 && (
          <div className="exam-empty-state">
            <div className="exam-empty-icon">
              {examSchedule.length > 0 ? '🎉' : '📭'}
            </div>
            <p className="exam-empty-text">
              {examSchedule.length > 0
                ? 'All exams completed!'
                : 'No exam schedule found'}
            </p>
            <p className="exam-empty-sub">
              {examSchedule.length > 0
                ? 'Great job finishing all your exams this term.'
                : 'Register for sections to see your upcoming exams here.'}
            </p>
          </div>
        )}

        {/* Exam cards – only upcoming courses */}
        {!loading && !error && visible.map(course => (
          <ExamCourseCard key={course.courseCode} course={course} />
        ))}

      </div>
    </div>
  )
}

/* ── Sub-component: ExamCourseCard ───────────────────────── */
/**
 * Shows the closest upcoming exam as the primary row.
 * If a secondary exam exists, a toggle button reveals it.
 *
 * Uses local useState for the expand toggle — this is presentation-only
 * state with no business logic, so it correctly lives in the View.
 */
function ExamCourseCard({ course }) {
  const [expanded, setExpanded] = useState(false)
  const shortCode = course.courseCode.replace(/[^A-Z0-9]/g, '').slice(0, 6)
  const exams     = pickExams(course)   // always non-null here (filtered above)

  if (!exams) return null

  const { primary, secondary } = exams

  return (
    <div className="exam-course-card">
      {/* Course header */}
      <div className="exam-course-header">
        <div className="exam-course-icon" aria-hidden="true">
          {shortCode}
        </div>
        <div className="exam-course-info">
          <div className="exam-course-code">{course.courseCode}</div>
          <div className="exam-course-name">{course.courseName}</div>
        </div>
      </div>

      {/* Exam rows */}
      <div className="exam-rows">

        {/* Primary — closest upcoming exam */}
        <ExamRow type={primary.type} dateIso={primary.dateIso} daysLeft={primary.daysLeft} />

        {/* Secondary — further exam, behind a toggle */}
        {secondary && (
          <>
            <button
              className="exam-expand-btn"
              onClick={() => setExpanded(prev => !prev)}
              aria-expanded={expanded}
              aria-label={expanded
                ? `Hide ${EXAM_TYPE_CONFIG[secondary.type].label}`
                : `Show ${EXAM_TYPE_CONFIG[secondary.type].label}`}
            >
              <span className="exam-expand-icon">{expanded ? '▲' : '▼'}</span>
              {expanded
                ? `Hide ${EXAM_TYPE_CONFIG[secondary.type].label}`
                : `${EXAM_TYPE_CONFIG[secondary.type].icon} Show ${EXAM_TYPE_CONFIG[secondary.type].label}`}
              <span className="exam-expand-days">
                ({formatDaysLeft(secondary.daysLeft)})
              </span>
            </button>

            {expanded && (
              <div className="exam-secondary-row">
                <ExamRow
                  type={secondary.type}
                  dateIso={secondary.dateIso}
                  daysLeft={secondary.daysLeft}
                />
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}

/* ── Sub-component: ExamRow ──────────────────────────────── */
/**
 * Renders a single exam row (Midterm or Final).
 * Pure presentational — no state or logic.
 */
function ExamRow({ type, dateIso, daysLeft }) {
  const cfg     = EXAM_TYPE_CONFIG[type]
  const urgency = getUrgency(daysLeft, type)
  const label   = formatDaysLeft(daysLeft)
  const date    = formatExamDate(dateIso)

  return (
    <div className="exam-row">
      <div className="exam-type-badge">
        <span className="exam-type-icon" aria-hidden="true">{cfg.icon}</span>
        <span className="exam-type-label">{cfg.label}</span>
      </div>
      <span className="exam-date-text">{date}</span>
      <span
        className={`exam-countdown ${urgency}`}
        aria-label={`${cfg.label}: ${label}`}
      >
        {label}
      </span>
    </div>
  )
}

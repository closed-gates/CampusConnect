/**
 * StudentAttendancePanel.jsx – View component for student attendance.
 *
 * MVC Role: View (component inside AttendanceView)
 * No state, no logic — all data and callbacks come from the controller.
 *
 * Shows:
 *   - Overall attendance ring + summary numbers
 *   - Per-course card grid (synced from registered courses)
 *   - Detail panel when a course is selected
 */

import { useStudentAttendanceController } from '../../controllers/studentAttendanceController.js'
import {
  getRateColor,
  getRateGradient,
  getAttendanceStatus,
  STATUS_CONFIG,
} from '../../models/studentAttendanceModel.js'

export default function StudentAttendancePanel() {
  const {
    courses,
    overallRate,
    loading,
    error,
    selectedCourse,
    selectCourse,
    refresh,
  } = useStudentAttendanceController()

  /* ── Loading ─────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="att-empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div className="att-loading-spinner" />
        <p style={{ color: 'var(--text-secondary)', marginTop: 16 }}>
          Loading your attendance…
        </p>
      </div>
    )
  }

  /* ── Error ───────────────────────────────────────────────────── */
  if (error) {
    return (
      <div className="att-empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>⚠️</div>
        <p style={{ color: '#ef4444', marginTop: 12 }}>{error}</p>
        <button className="att-btn att-btn-primary" style={{ marginTop: 16 }} onClick={refresh}>
          Retry
        </button>
      </div>
    )
  }

  /* ── No registered courses ───────────────────────────────────── */
  if (courses.length === 0) {
    return (
      <div className="att-empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📚</div>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>No Courses Registered</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 400, margin: '0 auto' }}>
          You haven't registered for any courses yet. Head to the{' '}
          <strong>Advising</strong> page to add courses — they'll appear here automatically.
        </p>
      </div>
    )
  }

  const status        = getAttendanceStatus(overallRate)
  const totalSessions = courses.reduce((s, c) => s + (c.totalSessions || 0), 0)
  const totalPresent  = courses.reduce((s, c) => s + (c.presentCount || 0), 0)
  const totalLate     = courses.reduce((s, c) => s + (c.lateCount || 0), 0)
  const totalAbsent   = courses.reduce((s, c) => s + (c.absentCount || 0), 0)

  return (
    <div className="student-att-panel">

      {/* ── Overall Summary ────────────────────────────────────── */}
      <div className="student-att-summary-card">
        {/* Circular ring */}
        <div className="student-att-ring-wrap">
          <svg className="student-att-ring" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10"/>
            <circle
              cx="60" cy="60" r="50"
              fill="none"
              stroke={getRateColor(overallRate)}
              strokeWidth="10"
              strokeDasharray={`${overallRate * 3.14} 314`}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dasharray 1s ease' }}
            />
          </svg>
          <div className="student-att-ring-label">
            <span className="student-att-rate-num" style={{ color: getRateColor(overallRate) }}>
              {overallRate}%
            </span>
            <span className="student-att-rate-sub">Overall</span>
          </div>
        </div>

        {/* Summary numbers */}
        <div className="student-att-summary-stats">
          <h2 className="student-att-summary-title">My Attendance Overview</h2>
          <p className="student-att-status-badge" style={{ color: status.color }}>
            ● {status.label}
          </p>

          <div className="student-att-stat-row">
            <div className="student-att-stat">
              <span className="student-att-stat-val">{courses.length}</span>
              <span className="student-att-stat-lbl">Courses</span>
            </div>
            <div className="student-att-stat">
              <span className="student-att-stat-val">{totalSessions}</span>
              <span className="student-att-stat-lbl">Sessions</span>
            </div>
            <div className="student-att-stat">
              <span className="student-att-stat-val" style={{ color: '#22c55e' }}>
                {totalPresent}
              </span>
              <span className="student-att-stat-lbl">Present</span>
            </div>
            <div className="student-att-stat">
              <span className="student-att-stat-val" style={{ color: '#f59e0b' }}>
                {totalLate}
              </span>
              <span className="student-att-stat-lbl">Late</span>
            </div>
            <div className="student-att-stat">
              <span className="student-att-stat-val" style={{ color: '#ef4444' }}>
                {totalAbsent}
              </span>
              <span className="student-att-stat-lbl">Absent</span>
            </div>
          </div>

          {overallRate < 75 && (
            <div className="student-att-warning-banner">
              ⚠️ Your attendance is below the 75% requirement. You may be barred from exams.
            </div>
          )}
        </div>
      </div>

      {/* ── Per-course grid ────────────────────────────────────── */}
      <h3 className="student-att-section-title">📋 Courses ({courses.length})</h3>
      <div className="student-att-course-grid">
        {courses.map(course => {
          const rate    = course.attendanceRate || 0
          const isSelected = selectedCourse?.courseId === course.courseId
          return (
            <button
              key={course.courseId}
              className={`student-att-course-card ${isSelected ? 'selected' : ''}`}
              onClick={() => selectCourse(isSelected ? null : course)}
              aria-pressed={isSelected}
            >
              {/* Course header */}
              <div className="sac-card-header">
                <span className="sac-course-code">{course.courseId}</span>
                <span
                  className="sac-rate-badge"
                  style={{
                    background: getRateColor(rate) + '22',
                    color:      getRateColor(rate),
                  }}
                >
                  {rate}%
                </span>
              </div>

              <p className="sac-course-name">{course.courseName}</p>
              <p className="sac-course-meta">
                Section {course.section} · {course.faculty}
              </p>

              {/* Progress bar */}
              <div className="sac-progress-track">
                <div
                  className="sac-progress-fill"
                  style={{
                    width:      `${Math.min(rate, 100)}%`,
                    background: getRateGradient(rate),
                  }}
                />
              </div>

              {/* Pill stats */}
              <div className="sac-stats-row">
                <span className="sac-pill sac-present">✅ {course.presentCount}</span>
                <span className="sac-pill sac-late">⏰ {course.lateCount}</span>
                <span className="sac-pill sac-absent">❌ {course.absentCount}</span>
                {course.totalSessions > 0 && (
                  <span className="sac-pill sac-total">{course.totalSessions} sessions</span>
                )}
              </div>

              {course.totalSessions === 0 && (
                <p className="sac-no-data">No sessions recorded yet</p>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Course detail panel ───────────────────────────────── */}
      {selectedCourse && (
        <div className="student-att-detail-panel">
          <div className="detail-panel-header">
            <h3>{selectedCourse.courseId} – {selectedCourse.courseName}</h3>
            <button
              className="detail-panel-close"
              onClick={() => selectCourse(null)}
              aria-label="Close detail"
            >
              ✕
            </button>
          </div>

          <div className="detail-panel-meta">
            <span>Section {selectedCourse.section}</span>
            <span>·</span>
            <span>Faculty: {selectedCourse.faculty}</span>
          </div>

          {/* Big rate display */}
          <div className="detail-rate-display" style={{ color: getRateColor(selectedCourse.attendanceRate) }}>
            {selectedCourse.attendanceRate}% Attendance
          </div>

          {/* Breakdown bars */}
          <div className="detail-breakdown">
            {[
              { key: 'presentCount', label: 'Present', color: '#22c55e', icon: '✅' },
              { key: 'lateCount',    label: 'Late',    color: '#f59e0b', icon: '⏰' },
              { key: 'absentCount',  label: 'Absent',  color: '#ef4444', icon: '❌' },
            ].map(({ key, label, color, icon }) => {
              const val     = selectedCourse[key] || 0
              const total   = selectedCourse.totalSessions || 1
              const pct     = Math.round(val / total * 100)
              return (
                <div key={key} className="detail-bar-row">
                  <span className="detail-bar-label">{icon} {label}</span>
                  <div className="detail-bar-track">
                    <div
                      className="detail-bar-fill"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                  <span className="detail-bar-count">{val}</span>
                </div>
              )
            })}
          </div>

          {selectedCourse.totalSessions === 0 && (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginTop: 24 }}>
              No attendance sessions have been recorded for this course yet.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

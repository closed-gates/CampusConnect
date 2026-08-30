import Sidebar from '../components/Sidebar.jsx'
import { useAttendanceController } from '../../controllers/attendanceController.js'
import {
  formatAttendanceDate,
  STATUS_CONFIG,
  calculateSummary,
} from '../../models/attendanceModel.js'
import StudentAttendancePanel from '../components/StudentAttendancePanel.jsx'
import './AttendancePage.css'

/**
 * AttendanceView – View layer for the Attendance Tracking page.
 *
 * MVC Role: View
 *
 * Role-aware rendering:
 *   - Student: shows StudentAttendancePanel with registered courses + per-course stats
 *   - Faculty/Admin: shows the full attendance marking workflow
 *
 * All state and logic is provided by useAttendanceController().
 */
export default function AttendanceView() {
  const {
    isFaculty,
    courses, selectedCourse, selectCourse, courseInfo, courseStudents,
    selectedDate, setSelectedDate,
    activeTab, setActiveTab,
    currentMarks, markStudent, markAll, submitAttendance, submitting, hasSubmitted,
    courseSummary, historyByDate, historyDates,
    loadingCourses, loadingStudents,
    toast,
  } = useAttendanceController()

  // Count marked students
  const markedCount   = Object.values(currentMarks).filter(Boolean).length
  const totalStudents = courseStudents.length
  const allMarked     = markedCount === totalStudents && totalStudents > 0

  return (
    <div className="dashboard-wrapper">
      <Sidebar activeItem="attendance" />

      <main className="dashboard-main" aria-label="Attendance Tracking">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-greeting">
            {isFaculty ? '📋 Faculty Attendance Tracking' : '📊 My Attendance'}
          </h1>
          <p className="dashboard-date">
            {isFaculty
              ? 'Record and manage student attendance for your courses.'
              : 'View attendance for your registered courses, synced from Advising.'}
          </p>
        </div>

        {/* Role badge */}
        <div className="club-role-badge-row">
          <span className={`club-role-badge ${isFaculty ? 'admin' : 'student'}`}>
            {isFaculty ? '👨‍🏫 Faculty' : '🎓 Student'}
          </span>
        </div>

        {/* ── Student view ─────────────────────────────────────── */}
        {!isFaculty && <StudentAttendancePanel />}

        {/* ── Faculty view: Course Selector ─────────────────────── */}
        {isFaculty && (
          <div className="att-course-selector">
            <h2 className="att-section-label">Select Course</h2>
            {loadingCourses ? (
              <p className="text-muted" style={{ padding: '16px' }}>Loading your courses…</p>
            ) : (
              <div className="att-course-grid">
                {courses.map(course => (
                  <button
                    key={course.id}
                    id={`course-select-${course.id}`}
                    className={`att-course-card ${selectedCourse === course.id ? 'active' : ''}`}
                    onClick={() => selectCourse(course.id)}
                    style={{ '--course-color': course.color }}
                  >
                    <div className="att-course-card-accent" />
                    <div className="att-course-card-body">
                      <div className="att-course-id">{course.id}</div>
                      <div className="att-course-name">{course.name}</div>
                      <div className="att-course-info">
                        <span>{course.totalStudents} students enrolled</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Faculty view: Tab Navigation ──────────────────────── */}
        {isFaculty && (
          <div className="att-tabs" role="tablist">
            <button
              id="att-tab-mark"
              role="tab"
              aria-selected={activeTab === 'mark'}
              className={`att-tab ${activeTab === 'mark' ? 'active' : ''}`}
              onClick={() => setActiveTab('mark')}
            >
              ✏️ Mark Attendance
            </button>
            <button
              id="att-tab-history"
              role="tab"
              aria-selected={activeTab === 'history'}
              className={`att-tab ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              📅 History
              <span className="att-tab-count">{historyDates.length}</span>
            </button>
            <button
              id="att-tab-summary"
              role="tab"
              aria-selected={activeTab === 'summary'}
              className={`att-tab ${activeTab === 'summary' ? 'active' : ''}`}
              onClick={() => setActiveTab('summary')}
            >
              📊 Summary
            </button>
          </div>
        )}

        {/* ── Faculty view: Mark Attendance Tab ─────────────────── */}
        {isFaculty && activeTab === 'mark' && (
          <div className="att-tab-content">
            {/* Date selector + quick actions */}
            <div className="att-mark-header">
              <div className="att-date-picker">
                <label className="form-label" htmlFor="att-date">Date</label>
                <input
                  id="att-date"
                  type="date"
                  className="form-input att-date-input"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="att-quick-actions">
                <button
                  id="mark-all-present"
                  className="att-quick-btn present"
                  onClick={() => markAll('PRESENT')}
                >
                  ✓ All Present
                </button>
                <button
                  id="mark-all-absent"
                  className="att-quick-btn absent"
                  onClick={() => markAll('ABSENT')}
                >
                  ✕ All Absent
                </button>
              </div>

              <div className="att-mark-progress">
                <span className="att-mark-count">
                  {markedCount}/{totalStudents} marked
                </span>
                <div className="att-mark-bar">
                  <div
                    className="att-mark-bar-fill"
                    style={{ width: totalStudents > 0 ? `${(markedCount / totalStudents) * 100}%` : '0%' }}
                  />
                </div>
              </div>
            </div>

            {hasSubmitted && (
              <div className="att-submitted-badge">
                ✅ Attendance already recorded for this date. You can update it below.
              </div>
            )}

            {/* Attendance Table */}
            <div className="att-table-wrapper">
              {loadingStudents ? (
                <p className="text-muted" style={{ padding: '24px', textAlign: 'center' }}>Loading students…</p>
              ) : (
                <table className="att-table" id="attendance-table">
                  <thead>
                    <tr>
                      <th className="att-th-num">#</th>
                      <th className="att-th-id">Student ID</th>
                      <th className="att-th-name">Student Name</th>
                      <th className="att-th-status">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courseStudents.map((student, index) => {
                      const status = currentMarks[student.id] || null
                      return (
                        <tr key={student.id} className={status ? `att-row-${status.toLowerCase()}` : ''}>
                          <td className="att-td-num">{index + 1}</td>
                          <td className="att-td-id">{student.id}</td>
                          <td className="att-td-name">
                            <div className="att-student-avatar">
                              {student.name.charAt(0)}
                            </div>
                            {student.name}
                          </td>
                          <td className="att-td-status">
                            <div className="att-status-group">
                              {['PRESENT', 'ABSENT', 'LATE'].map(s => (
                                <button
                                  key={s}
                                  id={`mark-${student.id}-${s.toLowerCase()}`}
                                  className={`att-status-btn ${s.toLowerCase()} ${status === s ? 'active' : ''}`}
                                  onClick={() => markStudent(student.id, s)}
                                  title={STATUS_CONFIG[s].label}
                                >
                                  <span className="att-status-icon">{STATUS_CONFIG[s].icon}</span>
                                  <span className="att-status-label">{STATUS_CONFIG[s].label}</span>
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Submit button */}
            <div className="att-submit-row">
              <button
                id="submit-attendance-btn"
                className={`btn btn-primary att-submit-btn ${allMarked ? 'ready' : ''}`}
                onClick={submitAttendance}
                disabled={submitting || !allMarked}
              >
                {submitting ? 'Saving…' : hasSubmitted ? '🔄 Update Attendance' : '✅ Save Attendance'}
              </button>
              {!allMarked && totalStudents > 0 && (
                <span className="att-submit-hint">
                  Mark all students to enable submission
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Faculty view: History Tab ──────────────────────────── */}
        {isFaculty && activeTab === 'history' && (
          <div className="att-tab-content">
            {historyDates.length === 0 ? (
              <div className="att-empty-state">
                <span className="att-empty-icon">📭</span>
                <p>No attendance records yet for {courseInfo?.name || 'this course'}.</p>
              </div>
            ) : (
              <div className="att-history-list">
                {historyDates.map(date => {
                  const records = historyByDate[date]
                  const summary = calculateSummary(records)
                  return (
                    <div key={date} className="att-history-card">
                      <div className="att-history-header">
                        <div className="att-history-date">
                          <span className="att-history-date-icon">📅</span>
                          {formatAttendanceDate(date)}
                        </div>
                        <div className="att-history-stats">
                          <span className="att-stat-chip present">✓ {summary.present}</span>
                          <span className="att-stat-chip absent">✕ {summary.absent}</span>
                          <span className="att-stat-chip late">⏱ {summary.late}</span>
                          <span className="att-stat-chip rate">{summary.rate}%</span>
                        </div>
                      </div>
                      <div className="att-history-students">
                        {records.map(r => (
                          <div key={r.id || `${r.studentId}-${r.date}`} className={`att-history-student ${r.status.toLowerCase()}`}>
                            <div className="att-student-avatar small">
                              {r.studentName.charAt(0)}
                            </div>
                            <span className="att-history-sname">{r.studentName}</span>
                            <span className={`att-history-badge ${r.status.toLowerCase()}`}>
                              {STATUS_CONFIG[r.status]?.icon} {STATUS_CONFIG[r.status]?.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Faculty view: Summary Tab ──────────────────────────── */}
        {isFaculty && activeTab === 'summary' && (
          <div className="att-tab-content">
            <div className="att-summary-grid">
              {/* Attendance Rate */}
              <div className="att-summary-card att-summary-rate">
                <div className="att-summary-circle">
                  <svg viewBox="0 0 36 36" className="att-circle-svg">
                    <path
                      className="att-circle-bg"
                      d="M18 2.0845
                         a 15.9155 15.9155 0 0 1 0 31.831
                         a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="att-circle-fill"
                      strokeDasharray={`${courseSummary.rate}, 100`}
                      d="M18 2.0845
                         a 15.9155 15.9155 0 0 1 0 31.831
                         a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="att-circle-text">{courseSummary.rate}%</span>
                </div>
                <div className="att-summary-label">Attendance Rate</div>
                <div className="att-summary-sub">{courseInfo?.name || selectedCourse}</div>
              </div>

              {/* Present */}
              <div className="att-summary-card">
                <div className="att-summary-icon present">✓</div>
                <div className="att-summary-value">{courseSummary.present}</div>
                <div className="att-summary-label">Total Present</div>
              </div>

              {/* Absent */}
              <div className="att-summary-card">
                <div className="att-summary-icon absent">✕</div>
                <div className="att-summary-value">{courseSummary.absent}</div>
                <div className="att-summary-label">Total Absent</div>
              </div>

              {/* Late */}
              <div className="att-summary-card">
                <div className="att-summary-icon late">⏱</div>
                <div className="att-summary-value">{courseSummary.late}</div>
                <div className="att-summary-label">Total Late</div>
              </div>

              {/* Sessions */}
              <div className="att-summary-card">
                <div className="att-summary-icon sessions">📋</div>
                <div className="att-summary-value">{historyDates.length}</div>
                <div className="att-summary-label">Total Sessions</div>
              </div>

              {/* Total Records */}
              <div className="att-summary-card">
                <div className="att-summary-icon records">📊</div>
                <div className="att-summary-value">{courseSummary.total}</div>
                <div className="att-summary-label">Total Records</div>
              </div>
            </div>

            {/* Per-student summary */}
            {courseStudents.length > 0 && (
              <div className="att-student-summary-section">
                <h3 className="att-section-label">Student-wise Summary</h3>
                <div className="att-table-wrapper">
                  <table className="att-table" id="student-summary-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Student</th>
                        <th>Present</th>
                        <th>Absent</th>
                        <th>Late</th>
                        <th>Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {courseStudents.map((student, i) => {
                        const studentRecords = historyDates.length > 0
                          ? Object.values(historyByDate).flat().filter(r => r.studentId === student.id)
                          : []
                        const sSummary = calculateSummary(studentRecords)
                        return (
                          <tr key={student.id}>
                            <td>{i + 1}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div className="att-student-avatar small">{student.name.charAt(0)}</div>
                                {student.name}
                              </div>
                            </td>
                            <td><span className="att-stat-chip present small">{sSummary.present}</span></td>
                            <td><span className="att-stat-chip absent small">{sSummary.absent}</span></td>
                            <td><span className="att-stat-chip late small">{sSummary.late}</span></td>
                            <td>
                              <div className="att-rate-bar">
                                <div className="att-rate-fill" style={{ width: `${sSummary.rate}%` }} />
                                <span className="att-rate-text">{sSummary.rate}%</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Toast (all roles) ───────────────────────────────────── */}
        {toast && (
          <div className={`club-toast ${toast.type}`} role="alert" aria-live="polite">
            {toast.message}
          </div>
        )}
      </main>
    </div>
  )
}

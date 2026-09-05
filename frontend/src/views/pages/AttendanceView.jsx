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
 *   - Faculty:  shows course selector then mark / history / summary tabs
 *   - Admin:    shows ALL sections, click any to view roster + history + summary (read-only)
 *
 * All state and logic is provided by useAttendanceController().
 */
export default function AttendanceView() {
  const {
    isFaculty, isAdmin, canMark,
    courses, selectedCourse, selectCourse, courseInfo, courseStudents,
    selectedDate, setSelectedDate,
    activeTab, setActiveTab,
    currentMarks, markStudent, markAll, submitAttendance, submitting, hasSubmitted,
    courseSummary, historyByDate, historyDates,
    loadingCourses, loadingStudents, loadingHistory, loadingSummary,
    toast,
  } = useAttendanceController()

  const markedCount   = Object.values(currentMarks).filter(Boolean).length
  const totalStudents = courseStudents.length
  const allMarked     = markedCount === totalStudents && totalStudents > 0

  return (
    <div className="dashboard-wrapper">
      <Sidebar activeItem="attendance" />

      <main className="dashboard-main" aria-label="Attendance Tracking">

        <div className="dashboard-header">
          <h1 className="dashboard-greeting">
            {isAdmin ? '🛡️ All Section Attendance' : isFaculty ? '📋 Faculty Attendance Tracking' : '📊 My Attendance'}
          </h1>
          <p className="dashboard-date">
            {isAdmin
              ? 'Click any section below to inspect its full attendance history and student roster.'
              : isFaculty
              ? 'Record and manage student attendance for your courses.'
              : 'View attendance for your registered courses, synced from Advising.'}
          </p>
        </div>

        <div className="club-role-badge-row">
          <span className={`club-role-badge ${isFaculty ? 'admin' : 'student'}`}>
            {isAdmin ? '🛡️ Administrator · Read only' : isFaculty ? '👨‍🏫 Faculty' : '🎓 Student'}
          </span>
        </div>

        {/* Student view */}
        {!isFaculty && <StudentAttendancePanel />}

        {/* Faculty / Admin: Section grid – hidden for admin once a section is selected */}
        {isFaculty && !(isAdmin && selectedCourse) && (
          <div className="att-course-selector">
            <h2 className="att-section-label">
              {isAdmin ? 'All Sections' : 'Select Course'}
            </h2>
            {loadingCourses ? (
              <p className="text-muted" style={{ padding: '16px' }}>
                {isAdmin ? 'Loading all sections…' : 'Loading your courses…'}
              </p>
            ) : courses.length === 0 ? (
              <div className="att-empty-state">
                <span className="att-empty-icon">📭</span>
                <p>{isAdmin ? 'No sections found.' : 'No courses assigned to you yet.'}</p>
              </div>
            ) : (
              <div className="att-course-grid">
                {courses.map(course => (
                  <button
                    key={`${course.id}-${course.section}`}
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
                        <span>
                          {course.section ? `Section ${course.section} · ` : ''}
                          {course.totalStudents} student{course.totalStudents !== 1 ? 's' : ''}
                        </span>
                        {isAdmin && course.faculty && (
                          <span style={{ color: 'var(--color-text-light)' }}>· {course.faculty}</span>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="att-admin-view-hint">Click to view details →</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Admin: Full Section Detail */}
        {isAdmin && selectedCourse && (
          <AdminSectionDetail
            courseInfo={courseInfo}
            courseStudents={courseStudents}
            historyDates={historyDates}
            historyByDate={historyByDate}
            courseSummary={courseSummary}
            loadingStudents={loadingStudents}
            loadingHistory={loadingHistory}
            loadingSummary={loadingSummary}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onBack={() => selectCourse('')}
          />
        )}

        {/* Faculty: Tab Navigation */}
        {canMark && (
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

        {/* Faculty: Mark tab */}
        {canMark && activeTab === 'mark' && (
          <div className="att-tab-content">
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
                <button id="mark-all-present" className="att-quick-btn present" onClick={() => markAll('PRESENT')}>
                  ✓ All Present
                </button>
                <button id="mark-all-absent" className="att-quick-btn absent" onClick={() => markAll('ABSENT')}>
                  ✕ All Absent
                </button>
              </div>
              <div className="att-mark-progress">
                <span className="att-mark-count">{markedCount}/{totalStudents} marked</span>
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
                            <div className="att-student-avatar">{student.name.charAt(0)}</div>
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
                <span className="att-submit-hint">Mark all students to enable submission</span>
              )}
            </div>
          </div>
        )}

        {/* Faculty: History tab */}
        {canMark && activeTab === 'history' && (
          <HistoryTabContent
            historyDates={historyDates}
            historyByDate={historyByDate}
            courseInfo={courseInfo}
          />
        )}

        {/* Faculty: Summary tab */}
        {canMark && activeTab === 'summary' && (
          <SummaryTabContent
            courseSummary={courseSummary}
            historyDates={historyDates}
            historyByDate={historyByDate}
            courseStudents={courseStudents}
            courseInfo={courseInfo}
          />
        )}

        {/* Toast */}
        {toast && (
          <div className={`club-toast ${toast.type}`} role="alert" aria-live="polite">
            {toast.message}
          </div>
        )}
      </main>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   AdminSectionDetail – full section detail for admins
   ─────────────────────────────────────────────────────────────── */
function AdminSectionDetail({
  courseInfo, courseStudents, historyDates, historyByDate,
  courseSummary, loadingStudents, loadingHistory, loadingSummary,
  activeTab, setActiveTab, onBack,
}) {
  return (
    <div className="att-admin-detail">
      <div className="att-admin-detail-header">
        <button className="att-admin-back-btn" onClick={onBack} id="admin-back-btn">
          ← All Sections
        </button>
        <div className="att-admin-detail-info">
          <div className="att-admin-detail-code">{courseInfo?.id}</div>
          <h2 className="att-admin-detail-name">{courseInfo?.name}</h2>
          <div className="att-admin-detail-meta">
            {courseInfo?.section && <span>Section {courseInfo.section}</span>}
            {courseInfo?.faculty && <span>· {courseInfo.faculty}</span>}
            <span>· {courseStudents.length} student{courseStudents.length !== 1 ? 's' : ''} enrolled</span>
            <span>· {historyDates.length} session{historyDates.length !== 1 ? 's' : ''} recorded</span>
          </div>
        </div>
        <div className="att-admin-rate-badge">
          <div className="att-admin-rate-value">{courseSummary.rate}%</div>
          <div className="att-admin-rate-label">Attendance Rate</div>
        </div>
      </div>

      <div className="att-tabs" role="tablist">
        <button
          id="admin-tab-students"
          role="tab"
          aria-selected={activeTab === 'students'}
          className={`att-tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          👥 Students
          <span className="att-tab-count">{courseStudents.length}</span>
        </button>
        <button
          id="admin-tab-history"
          role="tab"
          aria-selected={activeTab === 'history'}
          className={`att-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📅 History
          <span className="att-tab-count">{historyDates.length}</span>
        </button>
        <button
          id="admin-tab-summary"
          role="tab"
          aria-selected={activeTab === 'summary'}
          className={`att-tab ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          📊 Summary
        </button>
      </div>

      {activeTab === 'students' && (
        <div className="att-tab-content">
          {loadingStudents ? (
            <p className="text-muted" style={{ padding: '24px', textAlign: 'center' }}>Loading roster…</p>
          ) : courseStudents.length === 0 ? (
            <div className="att-empty-state">
              <span className="att-empty-icon">👥</span>
              <p>No students registered in this section.</p>
            </div>
          ) : (
            <div className="att-table-wrapper">
              <table className="att-table" id="admin-roster-table">
                <thead>
                  <tr>
                    <th className="att-th-num">#</th>
                    <th className="att-th-id">Student ID</th>
                    <th className="att-th-name">Name</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Late</th>
                    <th>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {courseStudents.map((student, i) => {
                    const recs = Object.values(historyByDate).flat().filter(r => r.studentId === student.id)
                    const s = calculateSummary(recs)
                    return (
                      <tr key={student.id}>
                        <td className="att-td-num">{i + 1}</td>
                        <td className="att-td-id">{student.id}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="att-student-avatar small">{student.name.charAt(0)}</div>
                            <span style={{ fontWeight: 600 }}>{student.name}</span>
                          </div>
                        </td>
                        <td><span className="att-stat-chip present small">{s.present}</span></td>
                        <td><span className="att-stat-chip absent small">{s.absent}</span></td>
                        <td><span className="att-stat-chip late small">{s.late}</span></td>
                        <td>
                          <div className="att-rate-bar">
                            <div className="att-rate-fill" style={{ width: `${s.rate}%` }} />
                            <span className="att-rate-text">{s.rate}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <HistoryTabContent
          historyDates={historyDates}
          historyByDate={historyByDate}
          courseInfo={courseInfo}
          loading={loadingHistory}
        />
      )}

      {activeTab === 'summary' && (
        <SummaryTabContent
          courseSummary={courseSummary}
          historyDates={historyDates}
          historyByDate={historyByDate}
          courseStudents={courseStudents}
          courseInfo={courseInfo}
          loading={loadingSummary}
        />
      )}
    </div>
  )
}

/* ── Shared: History tab ──────────────────────────────────────── */
function HistoryTabContent({ historyDates, historyByDate, courseInfo, loading }) {
  if (loading) {
    return (
      <div className="att-tab-content">
        <p className="text-muted" style={{ padding: '24px', textAlign: 'center' }}>Loading history…</p>
      </div>
    )
  }
  return (
    <div className="att-tab-content">
      {historyDates.length === 0 ? (
        <div className="att-empty-state">
          <span className="att-empty-icon">📭</span>
          <p>No attendance records yet for {courseInfo?.name || 'this section'}.</p>
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
                      <div className="att-student-avatar small">{r.studentName.charAt(0)}</div>
                      <span className="att-history-sname">{r.studentName}</span>
                      <span className="att-td-id" style={{ fontSize: 12, color: 'var(--color-text-light)' }}>
                        {r.studentId}
                      </span>
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
  )
}

/* ── Shared: Summary tab ─────────────────────────────────────── */
function SummaryTabContent({ courseSummary, historyDates, historyByDate, courseStudents, courseInfo, loading }) {
  if (loading) {
    return (
      <div className="att-tab-content">
        <p className="text-muted" style={{ padding: '24px', textAlign: 'center' }}>Loading summary…</p>
      </div>
    )
  }
  return (
    <div className="att-tab-content">
      <div className="att-summary-grid">
        <div className="att-summary-card att-summary-rate">
          <div className="att-summary-circle">
            <svg viewBox="0 0 36 36" className="att-circle-svg">
              <path
                className="att-circle-bg"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="att-circle-fill"
                strokeDasharray={`${courseSummary.rate}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="att-circle-text">{courseSummary.rate}%</span>
          </div>
          <div className="att-summary-label">Attendance Rate</div>
          <div className="att-summary-sub">{courseInfo?.name || ''}</div>
        </div>

        <div className="att-summary-card">
          <div className="att-summary-icon present">✓</div>
          <div className="att-summary-value">{courseSummary.present}</div>
          <div className="att-summary-label">Total Present</div>
        </div>

        <div className="att-summary-card">
          <div className="att-summary-icon absent">✕</div>
          <div className="att-summary-value">{courseSummary.absent}</div>
          <div className="att-summary-label">Total Absent</div>
        </div>

        <div className="att-summary-card">
          <div className="att-summary-icon late">⏱</div>
          <div className="att-summary-value">{courseSummary.late}</div>
          <div className="att-summary-label">Total Late</div>
        </div>

        <div className="att-summary-card">
          <div className="att-summary-icon sessions">📋</div>
          <div className="att-summary-value">{historyDates.length}</div>
          <div className="att-summary-label">Total Sessions</div>
        </div>

        <div className="att-summary-card">
          <div className="att-summary-icon records">📊</div>
          <div className="att-summary-value">{courseSummary.total}</div>
          <div className="att-summary-label">Total Records</div>
        </div>
      </div>

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
  )
}

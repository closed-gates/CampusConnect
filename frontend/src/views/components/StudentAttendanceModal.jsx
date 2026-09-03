import React, { useState } from 'react'

/**
 * StudentAttendanceModal – Modal displaying student's personal attendance report and history.
 *
 * MVC Role: View Component
 */
export default function StudentAttendanceModal({ isOpen, onClose, attendanceData }) {
  const [selectedCourse, setSelectedCourse] = useState('ALL')

  if (!isOpen) return null

  const report = attendanceData || {
    totalSessions: 0,
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    attendanceRate: 0,
    courseBreakdown: [],
    history: [],
  }

  const courseBreakdown = report.courseBreakdown || []
  const allHistory      = report.history || []

  const filteredHistory = selectedCourse === 'ALL'
    ? allHistory
    : allHistory.filter(h => h.courseId === selectedCourse)

  const getStatusBadge = (status) => {
    const s = (status || '').toUpperCase()
    if (s === 'PRESENT') {
      return <span className="status-badge badge-present">✓ Present</span>
    } else if (s === 'LATE') {
      return <span className="status-badge badge-late">⏱ Late</span>
    } else {
      return <span className="status-badge badge-absent">✗ Absent</span>
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">✅ Personal Attendance Report</h2>
            <p className="modal-subtitle">
              Session History & Attendance Analytics across enrolled courses
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Summary Stat Cards */}
          <div className="attendance-summary-banner">
            <div className="attendance-rate-box">
              {report.totalSessions === 0 ? (
                <>
                  <span className="rate-number" style={{ fontSize: '1.4rem', opacity: 0.75 }}>No Data</span>
                  <span className="rate-label">No classes have been conducted yet</span>
                </>
              ) : (
                <>
                  <span className="rate-number">{report.attendanceRate}%</span>
                  <span className="rate-label">Overall Attendance Rate</span>
                </>
              )}
            </div>
            <div className="attendance-stat-items">
              <div className="stat-pill present-pill">
                <span className="pill-val">{report.presentCount}</span>
                <span className="pill-lbl">Present</span>
              </div>
              <div className="stat-pill late-pill">
                <span className="pill-val">{report.lateCount}</span>
                <span className="pill-lbl">Late</span>
              </div>
              <div className="stat-pill absent-pill">
                <span className="pill-val">{report.absentCount}</span>
                <span className="pill-lbl">Absent</span>
              </div>
              <div className="stat-pill total-pill">
                <span className="pill-val">{report.totalSessions}</span>
                <span className="pill-lbl">Total Classes</span>
              </div>
            </div>
          </div>

          {/* Course Breakdown Cards */}
          {courseBreakdown.length > 0 && (
            <div className="attendance-courses-breakdown">
              <h3 className="section-subtitle">Course-Wise Attendance</h3>
              <div className="course-breakdown-grid">
                {courseBreakdown.map((cb, idx) => (
                  <div key={cb.courseId || idx} className="course-attendance-card">
                    <div className="card-top">
                      <strong className="cb-course-id">{cb.courseId}</strong>
                      <span className={`cb-rate-tag ${cb.attendanceRate >= 80 ? 'good' : 'warning'}`}>
                        {cb.attendanceRate}%
                      </span>
                    </div>
                    <div className="cb-course-name">{cb.courseName}</div>
                    <div className="cb-bar-track">
                      <div
                        className="cb-bar-fill"
                        style={{
                          width: `${Math.min(100, cb.attendanceRate)}%`,
                          background: cb.attendanceRate >= 80 ? 'var(--color-teal, #1A9882)' : '#F59E0B',
                        }}
                      />
                    </div>
                    <div className="cb-counts-row">
                      <span>✓ {cb.presentCount} present</span>
                      <span>⏱ {cb.lateCount} late</span>
                      <span>✗ {cb.absentCount} absent</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Session History */}
          <div className="attendance-history-section">
            <div className="history-header-row">
              <h3 className="section-subtitle">Session History Log</h3>
              {courseBreakdown.length > 0 && (
                <div className="history-filter-tabs">
                  <button
                    className={`filter-tab-btn ${selectedCourse === 'ALL' ? 'active' : ''}`}
                    onClick={() => setSelectedCourse('ALL')}
                  >
                    All Courses
                  </button>
                  {courseBreakdown.map(cb => (
                    <button
                      key={cb.courseId}
                      className={`filter-tab-btn ${selectedCourse === cb.courseId ? 'active' : ''}`}
                      onClick={() => setSelectedCourse(cb.courseId)}
                    >
                      {cb.courseId}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {filteredHistory.length === 0 ? (
              <p className="text-muted" style={{ padding: '20px', textAlign: 'center' }}>
                No session attendance records found.
              </p>
            ) : (
              <div className="history-table-container">
                <table className="attendance-history-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Course</th>
                      <th>Class Session</th>
                      <th>Status</th>
                      <th>Marked By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="font-medium">{item.date}</td>
                        <td>
                          <span className="course-tag">{item.courseId}</span>
                        </td>
                        <td>{item.courseName || item.courseId}</td>
                        <td>{getStatusBadge(item.status)}</td>
                        <td className="text-muted">{item.markedBy || 'Faculty'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

import React from 'react'

/**
 * EnrolledCoursesModal – Modal showing all enrolled/registered course details for the student.
 *
 * MVC Role: View Component
 */
export default function EnrolledCoursesModal({ isOpen, onClose, courses }) {
  if (!isOpen) return null

  const totalCredits = (courses || []).reduce((sum, c) => sum + (c.credits || 3), 0)

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content modal-md" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">🎓 Enrolled Courses</h2>
            <p className="modal-subtitle">
              Current Semester • {courses.length} Courses • {totalCredits} Credits
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {courses.length === 0 ? (
            <div className="empty-state-box">
              <span className="empty-state-icon">📚</span>
              <p>No courses registered yet.</p>
              <span className="text-muted">Register for course sections in the Advising portal.</span>
            </div>
          ) : (
            <div className="enrolled-courses-list">
              {courses.map((c, idx) => (
                <div key={c.id || idx} className="enrolled-course-card">
                  <div className="enrolled-course-header">
                    <div className="enrolled-course-badge">
                      <span className="course-code-badge">{c.code}</span>
                      <span className="course-section-badge">Sec {c.section || '01'}</span>
                    </div>
                    <span className="course-credits-badge">{c.credits || 3} Credits</span>
                  </div>

                  <h3 className="enrolled-course-title">{c.title || c.name || c.code}</h3>

                  <div className="enrolled-course-details-grid">
                    <div className="detail-item">
                      <span className="detail-label">👨‍🏫 Faculty</span>
                      <span className="detail-value">{c.faculty || c.instructor || 'TBA'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">🕒 Time</span>
                      <span className="detail-value">{c.time || 'TBA'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">📍 Room</span>
                      <span className="detail-value">{c.room || 'TBA'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">📝 Final Exam</span>
                      <span className="detail-value">{c.examDay || 'TBA'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

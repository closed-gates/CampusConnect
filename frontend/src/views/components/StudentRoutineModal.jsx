import React from 'react'
import { ROUTINE_DAYS, ROUTINE_TIME_SLOTS, sortTimeSlots } from '../../models/dashboardModel.js'

/**
 * StudentRoutineModal – Modal showing weekly class routine matrix for student's registered courses.
 *
 * MVC Role: View Component
 */
export default function StudentRoutineModal({ isOpen, onClose, courses, routineGrid, weeklyClassCount }) {
  if (!isOpen) return null

  // Always include all standard university lecture days including Saturday
  const activeDays = ROUTINE_DAYS
  const gridSlots = Object.keys(routineGrid).map(k => k.split('|')[1]).filter(Boolean)
  const activeSlots = sortTimeSlots([...new Set([...ROUTINE_TIME_SLOTS, ...gridSlots])])

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content modal-xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">📅 Class Routine & Timetable</h2>
            <p className="modal-subtitle">
              Weekly Schedule • {courses.length} Registered Courses • {weeklyClassCount} Classes/Week
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
              <span className="empty-state-icon">📅</span>
              <p>No class routine available.</p>
              <span className="text-muted">Register for course sections to view your scheduled timetable.</span>
            </div>
          ) : (
            <div className="routine-table-wrapper">
              <table className="routine-table">
                <thead>
                  <tr>
                    <th className="routine-slot-header">Time Slot</th>
                    {activeDays.map(day => (
                      <th key={day} className="routine-day-header">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activeSlots.map(slot => (
                    <tr key={slot}>
                      <td className="routine-slot-cell">{slot}</td>
                      {activeDays.map(day => {
                        const items = routineGrid[`${day}|${slot}`] || []
                        return (
                          <td key={`${day}-${slot}`} className="routine-cell">
                            {items.map((c, i) => (
                              <div key={i} className="routine-course-chip">
                                <div className="chip-code-row">
                                  <strong className="chip-code">{c.code}</strong>
                                  <span className="chip-section">Sec {c.section}</span>
                                </div>
                                <div className="chip-room">{c.room || 'TBA'}</div>
                                <div className="chip-faculty">{c.faculty || ''}</div>
                              </div>
                            ))}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <span className="text-muted" style={{ fontSize: '13px', marginRight: 'auto' }}>
            💡 Tip: Class timing matches standard 80-minute university lecture slots.
          </span>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

import Sidebar from '../components/Sidebar.jsx'
import { useRoutineController, isSoldOut, remainingSeats } from '../../controllers/routineController.js'

/**
 * RoutineView – View layer for the Routine Builder page.
 *
 * MVC Role: View
 * Renders the course picker, schedule grid, and controls.
 * All state and logic is provided by useRoutineController().
 */
export default function RoutineView() {
  const {
    availSearch, setAvailSearch,
    selSearch,   setSelSearch,
    highlighted, setHighlighted,
    available, filteredSelected, conflicts,
    highlightedCourse,
    isHighlightedSelected, isHighlightedAvailable,
    totalCredits, scheduleGrid,
    TIME_SLOTS, DAYS,
    addCourse, removeCourse,
    handleAddHighlighted, handleRemoveHighlighted, removeAll,
    handleDownload,
  } = useRoutineController()

  return (
    <div className="dashboard-wrapper">
      <Sidebar activeItem="routine" />
      <main className="dashboard-main routine-main" aria-label="Create Routine">

        <div className="dashboard-header">
          <h1 className="dashboard-greeting">📅 Create Routine</h1>
          <p className="dashboard-date">
            Search and select courses to build your weekly schedule.
            Phase 1 — static data. Database integration in Phase 2.
          </p>
        </div>

        <div className="routine-picker-wrapper">

          {/* Left info panel */}
          <div className="routine-info-panel left-info">
            <h3 className="routine-info-title">Info for Available</h3>
            {(!highlightedCourse || isHighlightedSelected) ? (
              <p className="routine-info-hint">Click a course in <em>Available Courses</em> to see details.</p>
            ) : (
              <CourseInfoBlock
                course={highlightedCourse}
                conflicts={conflicts}
                isTaken={!!available.find(c => c.id === highlighted)?.isTaken}
              />
            )}
          </div>

          {/* Available courses list */}
          <div className="routine-list-col">
            <input
              id="routine-avail-search"
              className="form-input routine-search"
              placeholder="Search Course Code, eg – CSE110"
              value={availSearch}
              onChange={e => setAvailSearch(e.target.value)}
              aria-label="Search available courses"
            />
            <div className="routine-list-header">Available Courses</div>
            <div className="routine-list" role="listbox" aria-label="Available courses">
              {available.length === 0 && <div className="routine-list-empty">No courses found</div>}
              {available.map(c => (
                <button
                  key={c.id}
                  id={`avail-${c.id}`}
                  className={[
                    'routine-list-item',
                    c.isTaken ? 'taken' : '',
                    c.isTaken && highlighted === c.id  ? 'taken-highlighted' : '',
                    !c.isTaken && highlighted === c.id ? 'highlighted'       : '',
                    !c.isTaken && isSoldOut(c)         ? 'sold-out'          : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => setHighlighted(c.id)}
                  onDoubleClick={c.isTaken ? undefined : () => addCourse(c)}
                  aria-disabled={c.isTaken}
                  aria-selected={highlighted === c.id}
                  title={c.isTaken ? 'Drop your current section to add a different one' : isSoldOut(c) ? 'No seats remaining' : 'Double-click or use › to add'}
                >
                  {c.code}: sec-{c.section}
                  {c.isTaken  && <span className="taken-badge">Taken</span>}
                  {!c.isTaken && isSoldOut(c) && <span className="sold-out-badge">Full</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Arrow controls */}
          <div className="routine-arrows">
            <button id="routine-add-btn"        className="arrow-btn"          title="Add highlighted course"    onClick={handleAddHighlighted}>›</button>
            <button id="routine-remove-btn"     className="arrow-btn"          title="Remove highlighted course" onClick={handleRemoveHighlighted}>‹</button>
            <button id="routine-remove-all-btn" className="arrow-btn arrow-btn-all" title="Remove all"          onClick={removeAll}>«</button>
          </div>

          {/* Selected courses list */}
          <div className="routine-list-col">
            <input
              id="routine-sel-search"
              className="form-input routine-search"
              placeholder="Search Course Code, eg – CSE110"
              value={selSearch}
              onChange={e => setSelSearch(e.target.value)}
              aria-label="Search selected courses"
            />
            <div className="routine-list-header">Selected Courses</div>
            <div className="routine-list routine-list-selected" role="listbox" aria-label="Selected courses">
              {filteredSelected.length === 0 && <div className="routine-list-empty">No courses selected</div>}
              {filteredSelected.map(c => (
                <button
                  key={c.id}
                  id={`sel-${c.id}`}
                  className={`routine-list-item ${highlighted === c.id ? 'highlighted' : ''} ${conflicts.has(c.id) ? 'conflict' : ''}`}
                  onClick={() => setHighlighted(c.id)}
                  onDoubleClick={() => removeCourse(c)}
                  aria-selected={highlighted === c.id}
                  title={conflicts.has(c.id) ? 'Time conflict!' : 'Double-click or use ‹ to remove'}
                >
                  {c.code}: sec-{c.section}
                  {conflicts.has(c.id) && <span className="conflict-badge">⚠</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Right info panel */}
          <div className="routine-info-panel right-info">
            <h3 className="routine-info-title">Info for Selected</h3>
            {(!highlightedCourse || isHighlightedAvailable) ? (
              <p className="routine-info-hint">Click a course in <em>Selected Courses</em> to see details.</p>
            ) : (
              <CourseInfoBlock course={highlightedCourse} conflicts={conflicts} />
            )}
          </div>
        </div>

        {/* Total Credits */}
        <div className="routine-credits-bar">
          Total Credits: <strong>{totalCredits}</strong>
          {conflicts.size > 0 && (
            <span className="routine-conflict-warning">
              ⚠ {conflicts.size / 2} time conflict{conflicts.size / 2 !== 1 ? 's' : ''} detected
            </span>
          )}
        </div>

        {/* Weekly Schedule Grid */}
        <div className="section-card routine-schedule-card">
          <div className="section-header"><h2 className="section-title">Weekly Schedule</h2></div>
          <div className="routine-table-wrapper">
            <table className="routine-schedule-table">
              <thead>
                <tr>
                  <th>Time / Day</th>
                  {DAYS.map(d => <th key={d}>{d}</th>)}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map(slot => (
                  <tr key={slot}>
                    <td className="routine-time-cell">{slot}</td>
                    {DAYS.map(day => {
                      const courses = scheduleGrid[`${day}|${slot}`] || []
                      return (
                        <td key={day} className="routine-schedule-cell">
                          {courses.map(c => (
                            <div
                              key={c.id}
                              className={`routine-schedule-entry ${conflicts.has(c.id) ? 'conflict-entry' : ''}`}
                              title={`${c.code}-${c.section}: ${c.title}`}
                              onClick={() => setHighlighted(c.id)}
                            >
                              {c.code}-{String(c.section).padStart(2, '0')}-{c.room}
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
        </div>

        {/* Download Button */}
        <div className="routine-download-row">
          <button
            id="routine-download-btn"
            className="btn btn-primary routine-download-btn"
            disabled={filteredSelected.length === 0}
            onClick={handleDownload}
          >
            ⬇ Download the Routine
          </button>
        </div>

      </main>
    </div>
  )
}

/* ── Sub-component: Course Info Block ───────────────── */
function CourseInfoBlock({ course, conflicts, isTaken = false }) {
  const remaining  = remainingSeats(course)
  const isConflict = conflicts.has(course.id)

  return (
    <div className="course-info-block">
      {isTaken && (
        <div className="cib-taken-notice">
          ⚠ Another section already added.
          Drop it from <em>Selected Courses</em> to switch.
        </div>
      )}
      <p className="cib-row"><span className="cib-label">Course Code:</span>
        <span className={`cib-value cib-code ${isConflict ? 'cib-conflict' : ''}`}>{course.code}</span></p>
      <p className="cib-row"><span className="cib-label">Course Title:</span>
        <span className="cib-value cib-title">{course.title}</span></p>
      <p className="cib-row"><span className="cib-label">Faculty:</span>
        <span className="cib-value">{course.faculty}</span></p>
      {course.credits && (
        <p className="cib-row"><span className="cib-label">Credits:</span>
          <span className="cib-value">{course.credits}</span></p>
      )}
      <p className="cib-row"><span className="cib-label">Time:</span>
        <span className="cib-value cib-time">
          {course.time === 'TBA'
            ? <em style={{ color: 'var(--color-text-sub)' }}>Schedule TBA</em>
            : `${course.time} · ${course.room}`}
        </span></p>
      {course.midtermDay && (
        <p className="cib-row"><span className="cib-label">Midterm:</span>
          <span className="cib-value" style={{ color: '#B45309', fontWeight: 500 }}>{course.midtermDay}</span></p>
      )}
      <p className="cib-row"><span className="cib-label">Final Exam:</span>
        <span className="cib-value">{course.examDay || 'TBA'}</span></p>
      {course.totalSeats > 0 && (
        <>
          <p className="cib-row"><span className="cib-label">Total Seats:</span>
            <span className="cib-value">{course.totalSeats}</span></p>
          <p className="cib-row"><span className="cib-label">Seats Booked:</span>
            <span className="cib-value">{course.booked}</span></p>
          <p className="cib-row"><span className="cib-label">Remaining:</span>
            <span className={`cib-value ${remaining <= 0 ? 'cib-danger' : remaining <= 5 ? 'cib-warn' : 'cib-safe'}`}>{remaining}</span></p>
        </>
      )}
      {course.tags && course.tags.length > 0 && (
        <p className="cib-row"><span className="cib-label">Tags:</span>
          <span className="cib-value" style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {course.tags.map(t => (
              <span key={t} style={{ background: '#EFF6FF', color: '#1D4ED8', borderRadius: 4, padding: '1px 7px', fontSize: '0.7rem', fontWeight: 600 }}>{t}</span>
            ))}
          </span>
        </p>
      )}
      {course.description && (
        <p className="cib-row" style={{ alignItems: 'flex-start' }}>
          <span className="cib-label" style={{ marginTop: 2 }}>About:</span>
          <span className="cib-value" style={{ fontSize: '0.75rem', lineHeight: 1.5, color: 'var(--color-text-sub)' }}>{course.description}</span>
        </p>
      )}
    </div>
  )
}

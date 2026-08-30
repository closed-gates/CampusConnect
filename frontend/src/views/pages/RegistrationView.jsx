/**
 * RegistrationView.jsx
 *
 * MVC Role: View
 *
 * Exports a single default component <RegistrationSection /> that is
 * embedded directly inside AdvisingView's StudentPanel — NOT rendered
 * as a standalone page. It has no Sidebar or page wrapper of its own.
 *
 * Advisor profile: This component is never rendered for advisors.
 * That guarantee is enforced in AdvisingView (only StudentPanel renders it).
 */

import { useRegistrationController } from '../../controllers/registrationController.js'
import { getStatusConfig, SECTION_ORDER_OPTIONS, ADVISING_TIERS } from '../../models/registrationModel.js'
import './RegistrationPage.css'

export default function RegistrationSection() {
  const ctrl = useRegistrationController()

  return (
    <div className="reg-root">
      {/* WebSocket Live indicator */}
      <div className="reg-ws-row">
        <span className={`reg-ws-dot ${ctrl.wsConnected ? 'reg-ws-dot--live' : 'reg-ws-dot--off'}`} />
        <span className="reg-ws-label">{ctrl.wsConnected ? 'Live seat updates active' : 'Connecting to live updates…'}</span>
      </div>

      {/* Advising Window Banner */}
      <AdvisingWindowBanner windowStatus={ctrl.windowStatus} />

      {/* My Registered Courses */}
      <MyRegistrations
        myRegistrations={ctrl.myRegistrations}
        registeredCredits={ctrl.registeredCredits}
        windowStatus={ctrl.windowStatus}
        onDrop={ctrl.handleDrop}
      />

      {/* Section Browser */}
      <SectionBrowser ctrl={ctrl} />

      {/* Toast */}
      {ctrl.toast && (
        <div className={`reg-toast reg-toast--${ctrl.toastType}`} role="alert" aria-live="assertive">
          {ctrl.toast}
        </div>
      )}
    </div>
  )
}

/* ─── Advising Window Banner ─────────────────────────────────── */
function AdvisingWindowBanner({ windowStatus }) {
  if (!windowStatus) return null
  const tier   = ADVISING_TIERS.find(t => t.tier === windowStatus.tier) || ADVISING_TIERS[2]
  const isOpen = windowStatus.open

  return (
    <div className={`reg-window-banner reg-window-banner--${isOpen ? 'open' : 'closed'}`} role="status">
      <div className="reg-window-icon">{tier.icon}</div>
      <div className="reg-window-content">
        <div className="reg-window-tier">{tier.label}</div>
        <div className="reg-window-msg">{windowStatus.message}</div>
        <div className="reg-window-meta">
          Rank <strong>{windowStatus.rank}</strong> of <strong>{windowStatus.totalStudents}</strong> students
          &nbsp;·&nbsp; {windowStatus.completedCredits} credits completed
          &nbsp;·&nbsp; Opens: <strong>{windowStatus.opensAt}</strong>
        </div>
      </div>
      <div className={`reg-window-badge ${isOpen ? 'reg-window-badge--open' : 'reg-window-badge--closed'}`}>
        {isOpen ? '✅ Window Open' : '🔒 Not Yet Open'}
      </div>
    </div>
  )
}

/* ─── My Registered Courses ──────────────────────────────────── */
function MyRegistrations({ myRegistrations = [], registeredCredits = 0, windowStatus, onDrop }) {
  const creditLimit = windowStatus?.open ? 15 : 0
  const creditPct   = creditLimit > 0 ? Math.min(100, Math.round((registeredCredits / creditLimit) * 100)) : 0

  return (
    <div className="section-card reg-my-card">
      <div className="section-header">
        <h2 className="section-title">My Registered Courses</h2>
        <span className="reg-credit-badge">{registeredCredits} / {creditLimit} credits</span>
      </div>

      <div className="reg-credit-bar-wrap">
        <div className="reg-credit-bar">
          <div className="reg-credit-fill" style={{
            width: `${creditPct}%`,
            background: creditPct >= 100 ? '#EF4444' : creditPct >= 80 ? '#F59E0B' : '#1A9882',
          }} />
        </div>
        <span className="reg-credit-pct">{creditPct}% of credit limit</span>
      </div>

      {myRegistrations.length === 0 ? (
        <div className="reg-empty-state">
          <span className="reg-empty-icon">📭</span>
          <p>No courses registered yet. Browse open sections below.</p>
        </div>
      ) : (
        <div className="reg-my-table-wrap">
          <table className="reg-my-table">
            <thead>
              <tr>
                <th>Code</th><th>Sec</th><th>Title</th>
                <th>Schedule</th><th>Room</th><th>Faculty</th>
                <th>Seats Left</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {myRegistrations.map(sec => {
                const remaining = sec.seatsRemaining ?? ((sec.totalSeats ?? 0) - (sec.booked ?? 0))
                const cfg = getStatusConfig(remaining, sec.totalSeats ?? 0)
                return (
                  <tr key={sec.id} className="reg-my-row">
                    <td><span className="reg-code-badge">{sec.code}</span></td>
                    <td>{sec.section}</td>
                    <td>{sec.title}</td>
                    <td className="reg-time-cell">{sec.time}</td>
                    <td>{sec.room}</td>
                    <td>{sec.faculty}</td>
                    <td><span className="reg-seat-mini" style={{ color: cfg.color }}>{remaining} left</span></td>
                    <td>
                      <button id={`reg-drop-${sec.id}`} className="reg-btn-drop" onClick={() => onDrop(sec.id)}>
                        Drop
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* ─── Section Browser ────────────────────────────────────────── */
function SectionBrowser({ ctrl }) {
  const { sections = [], loading, error, filterCode, setFilterCode,
          sectionOrder, setSectionOrder, windowStatus, handleRegister, handleDrop, fetchAll } = ctrl
  const windowOpen = windowStatus?.open ?? false


  return (
    <div className="section-card reg-browser-card">
      <div className="section-header">
        <h2 className="section-title">Available Sections</h2>
        <span className="reg-count-badge">{sections.length} sections</span>
      </div>

      {/* Filters: search + single sort dropdown */}
      <div className="reg-filters">
        <div className="reg-search-wrap">
          <span className="reg-search-icon">🔍</span>
          <input
            id="reg-search-input"
            className="reg-search-input"
            placeholder="Search by code, title, instructor…"
            value={filterCode}
            onChange={e => setFilterCode(e.target.value)}
          />
        </div>

        <select
          id="reg-order-select"
          className="reg-select"
          value={sectionOrder}
          onChange={e => setSectionOrder(e.target.value)}
        >
          {SECTION_ORDER_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="reg-skeleton-list">
          {[1,2,3,4,5].map(i => <div key={i} className="reg-skeleton-card" />)}
        </div>
      )}

      {!loading && error && (
        <div className="reg-error-state" role="alert">
          <span>⚠️</span><p>{error}</p>
          <button className="reg-retry-btn" onClick={fetchAll}>Retry</button>
        </div>
      )}

      {!loading && !error && sections.length === 0 && (
        <div className="reg-empty-state">
          <span className="reg-empty-icon">🔎</span>
          <p>No sections match your search.</p>
        </div>
      )}

      {!loading && !error && sections.length > 0 && (
        <div className="reg-section-grid">
          {sections.map(sec => (
            <SectionCard
              key={sec.id}
              section={sec}
              windowOpen={windowOpen}
              onRegister={handleRegister}
              onDrop={handleDrop}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Section Card ───────────────────────────────────────────── */
function SectionCard({ section: sec, windowOpen, onRegister, onDrop }) {
  const remaining           = sec.seatsRemaining ?? ((sec.totalSeats ?? 0) - (sec.booked ?? 0))
  const cfg                 = getStatusConfig(remaining, sec.totalSeats ?? 0)
  const isFull              = remaining <= 0
  const isRegistered        = sec.registeredByStudent ?? false
  const prereqMet           = sec.prerequisiteMet ?? true
  const courseAlreadyTaken  = sec.courseAlreadyRegistered ?? false  // another section of same course is registered
  const unmet               = sec.unmetPrerequisites ?? []
  const cantRegister        = isFull || isRegistered || !prereqMet || !windowOpen || courseAlreadyTaken

  let btnLabel = '+ Register'
  if (isRegistered)         btnLabel = '✅ Registered'
  else if (courseAlreadyTaken) btnLabel = '🔁 Course Taken'
  else if (isFull)          btnLabel = '🚫 Full'
  else if (!prereqMet)      btnLabel = '🔒 Prereq'
  else if (!windowOpen)     btnLabel = '⏳ Closed'

  return (
    <div
      className={`reg-section-card
        ${isRegistered     ? 'reg-section-card--registered' : ''}
        ${isFull           ? 'reg-section-card--full'       : ''}
        ${courseAlreadyTaken ? 'reg-section-card--taken'    : ''}`}
      id={`reg-section-${sec.id}`}
    >
      {/* Header */}
      <div className="reg-card-header">
        <div className="reg-card-codes">
          <span className="reg-code-badge">{sec.code}</span>
          <span className="reg-section-num">Sec {sec.section}</span>
        </div>
        <div className="reg-status-badge" style={{ color: cfg.color, background: cfg.bg }}>
          {cfg.label}
        </div>
      </div>

      <div className="reg-card-title">{sec.title}</div>

      <div className="reg-card-meta">
        <span>👤 {sec.faculty}</span>
        <span>📅 {sec.time}</span>
        <span>📍 {sec.room}</span>
      </div>

      {/* Live seat meter — updates instantly on WebSocket broadcast */}
      <div className="reg-seat-meter-wrap">
        <div className="reg-seat-bar-track">
          <div
            className={`reg-seat-bar-fill reg-seat-bar-fill--${cfg.variant}`}
            style={{ width: `${cfg.pct}%` }}
          />
        </div>
        <div className="reg-seat-counts">
          <span className="reg-seat-remaining" style={{ color: cfg.color }}>
            {remaining} seat{remaining !== 1 ? 's' : ''} left
          </span>
          <span className="reg-seat-total">of {sec.totalSeats}</span>
        </div>
      </div>

      {/* Course already taken notice */}
      {courseAlreadyTaken && (
        <div className="reg-taken-notice">
          🔁 You have already registered a section of <strong>{sec.code}</strong>
        </div>
      )}

      {/* Prerequisite */}
      {sec.prerequisiteCodes && !courseAlreadyTaken && (
        <div className={`reg-prereq-badge ${prereqMet ? 'reg-prereq-badge--met' : 'reg-prereq-badge--unmet'}`}>
          {prereqMet ? '✅' : '🔒'}&nbsp;
          {prereqMet ? `Prereq: ${sec.prerequisiteCodes}` : `Required: ${unmet.join(', ')}`}
        </div>
      )}

      {/* Exam */}
      {sec.examDay && <div className="reg-exam-date">🗓 Final: {sec.examDay}</div>}

      {/* Action */}
      <div className="reg-card-actions">
        {isRegistered ? (
          <button id={`reg-drop-card-${sec.id}`} className="reg-btn-drop" onClick={() => onDrop(sec.id)}>
            ✕ Drop Section
          </button>
        ) : (
          <button
            id={`reg-register-${sec.id}`}
            className={`reg-btn-register ${cantRegister ? 'reg-btn-register--disabled' : ''}`}
            disabled={cantRegister}
            onClick={() => !cantRegister && onRegister(sec.id)}
          >
            {btnLabel}
          </button>
        )}
      </div>
    </div>
  )
}


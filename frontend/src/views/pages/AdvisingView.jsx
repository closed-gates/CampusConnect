import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar.jsx'
import { useAdvisorController } from '../../controllers/advisingController.js'
import { useAdminAdvisingController } from '../../controllers/adminAdvisingController.js'
import RegistrationSection from './RegistrationView.jsx'
import { getStoredUser, isUserAdvisor } from '../../models/authModel.js'
import { adminAdvisingService } from '../../services/adminAdvisingService.js'

/**
 * AdvisingView – Role-aware advising portal.
 *
 * MVC Role: View
 * Handles 4 distinct views:
 * 1. STUDENT: Self-registration & registered courses
 * 2. FACULTY (Unauthorized): Restricted advising notice
 * 3. FACULTY (Advisor): Student course assignment, routine viewer & confirmation
 * 4. ADMIN: Advising management, section creation & capacity bypass enrolment
 */
export default function AdvisingView() {
  const user = getStoredUser()
  const role = (user?.role || 'STUDENT').toUpperCase()

  const [hasAdvisorRole, setHasAdvisorRole] = useState(isUserAdvisor())
  const [checkingStatus, setCheckingStatus] = useState(role === 'FACULTY')

  useEffect(() => {
    if (role === 'FACULTY' && user?.userId) {
      adminAdvisingService.getAdvisorStatus(user.userId)
        .then(res => {
          setHasAdvisorRole(Boolean(res.isAdvisor))
          localStorage.setItem('isAdvisor', res.isAdvisor ? 'true' : 'false')
        })
        .catch(() => {})
        .finally(() => setCheckingStatus(false))
    }
  }, [role, user?.userId])

  const renderContent = () => {
    if (role === 'ADMIN') {
      return <AdminAdvisingPanel />
    }
    if (role === 'FACULTY') {
      if (checkingStatus) {
        return (
          <div className="section-card" style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div className="skeleton-line skeleton-line--title" style={{ width: '40%', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--color-text-sub)' }}>Verifying advising privileges…</p>
          </div>
        )
      }
      return hasAdvisorRole ? <AdvisorPanel /> : <UnauthorizedAdvisorPanel user={user} />
    }
    // Default: Student panel
    return <StudentPanel />
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar activeItem="advising" />
      <main className="dashboard-main">
        {renderContent()}
      </main>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   1. STUDENT PANEL
═══════════════════════════════════════════════════════════════ */
function StudentPanel() {
  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">Advising & Course Registration 🎓</h1>
          <p className="dashboard-date">Browse open sections and register during your advising window</p>
        </div>
      </div>
      <RegistrationSection />
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   2. UNAUTHORIZED FACULTY PANEL
═══════════════════════════════════════════════════════════════ */
function UnauthorizedAdvisorPanel({ user }) {
  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">Faculty Advising Portal 🔒</h1>
          <p className="dashboard-date">Advising access control and student allocation</p>
        </div>
      </div>

      <div className="section-card" style={{ textAlign: 'center', padding: '60px 24px', maxWidth: 640, margin: '30px auto' }}>
        <div style={{ fontSize: 52, marginBottom: 16 }}>🛡️</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: 'var(--color-text-primary)' }}>
          Advising Portal Restricted
        </h2>
        <p style={{ fontSize: 14, color: 'var(--color-text-sub)', lineHeight: 1.6, marginBottom: 20 }}>
          Hello <strong>{user?.fullName || 'Faculty Member'}</strong> ({user?.userId}). The advising panel is accessible only to faculty profiles that have been designated with the <strong>Advisor Role</strong> by the University Administrator.
        </p>
        <div style={{
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: 8,
          padding: '12px 18px',
          fontSize: 13,
          color: '#B45309',
          display: 'inline-block',
          textAlign: 'left'
        }}>
          💡 <strong>Need Access?</strong> Please contact the Admin Department to grant advising privileges to your account (<code>{user?.userId}</code>).
        </div>
      </div>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   3. ADVISOR PANEL (Designated Faculty & Admin)
═══════════════════════════════════════════════════════════════ */
function AdvisorPanel({ isAdmin = false, advisorCtrl: passedCtrl }) {
  const defaultCtrl = useAdvisorController()
  const ctrl = passedCtrl || defaultCtrl

  const {
    students, selectedStudent, profile,
    courseSearch, setCourseSearch,
    filteredCourses,
    studentRoutine,
    loading, profileLoading, coursesLoading, confirming,
    toast, toastType,
    creditUsed, creditLimit, courseCount, courseLimit,
    seatUpdates,
    handleSelectStudent,
    handleAssign,
    handleRemove,
    handleConfirmAdvising,
  } = ctrl

  const [activeTab, setActiveTab] = useState('courses') // 'courses' | 'routine'

  const assignedCodes = new Set(profile?.advisedCourses?.map(c => c.courseCode) ?? [])
  const creditPct = creditLimit > 0 ? Math.round((creditUsed / creditLimit) * 100) : 0

  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">
            {isAdmin ? 'Student Course Advising 🧑‍🏫' : 'Advisor Panel 🧑‍🏫'}
          </h1>
          <p className="dashboard-date">Assign and manage course schedules, routines, and confirm advising for students</p>
        </div>
      </div>

      <div className="adv-advisor-layout">
        {/* ── Left column: Student Profile & Routine Summary ── */}
        <div className="adv-left-col">
          {/* Student selector */}
          <div className="section-card">
            <h2 className="section-title" style={{ marginBottom: 12 }}>Select Advisee</h2>
            {loading ? (
              <div className="skeleton-line skeleton-line--title" style={{ width: '100%', height: 38 }} />
            ) : (
              <select
                id="adv-student-selector"
                className="adv-student-select"
                value={selectedStudent ?? ''}
                onChange={e => handleSelectStudent(e.target.value)}
              >
                {students.map(s => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.studentName} ({s.studentId})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Student status card */}
          {profileLoading && (
            <div className="section-card">
              {[1,2,3,4].map(i => <div key={i} className="skeleton-line" style={{ marginBottom: 10 }} />)}
            </div>
          )}

          {!profileLoading && profile && (
            <div className="section-card adv-profile-card">
              <div className="adv-profile-header">
                <div className="adv-profile-avatar">
                  {profile.studentName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="adv-profile-name">{profile.studentName}</div>
                  <div className="adv-profile-sub">{profile.department} · Year {profile.year}</div>
                  <div className="adv-profile-sub">{profile.email}</div>
                </div>
              </div>

              <div className="adv-profile-stats">
                <div className="adv-stat">
                  <span className="adv-stat-label">CGPA</span>
                  <span className="adv-stat-value" style={{ color: profile.cgpa >= 2.0 ? '#10B981' : '#EF4444' }}>
                    {profile.cgpa?.toFixed(2)}
                  </span>
                </div>
                <div className="adv-stat">
                  <span className="adv-stat-label">Completed</span>
                  <span className="adv-stat-value">{profile.completedCredits} cr</span>
                </div>
                <div className="adv-stat">
                  <span className="adv-stat-label">Year</span>
                  <span className="adv-stat-value">{profile.year}</span>
                </div>
              </div>

              {profile.onProbation && (
                <div className="adv-probation-badge" style={{ marginTop: 12 }}>
                  ⚠️ PROBATIONARY STATUS — Max {profile.courseLimit} courses / {profile.creditLimit} credits
                </div>
              )}

              {/* Credit meter */}
              <div style={{ marginTop: 16 }}>
                <div className="adv-meter-labels">
                  <span>Credits: {creditUsed} / {creditLimit}</span>
                  <span>Courses: {courseCount} / {courseLimit}</span>
                </div>
                <div className="adv-credit-meter">
                  <div
                    className="adv-credit-fill"
                    style={{ width: `${Math.min(creditPct, 100)}%`,
                             background: creditPct >= 100 ? '#EF4444' : creditPct >= 80 ? '#F59E0B' : '#1A9882' }}
                  />
                </div>
                <div className="adv-credit-pct-label">{creditPct}% of limit used</div>
              </div>

              {/* Assigned courses list */}
              {profile.advisedCourses?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div className="adv-assigned-header">Assigned Courses ({profile.advisedCourses.length})</div>
                  {profile.advisedCourses.map(c => (
                    <div key={c.id} className="adv-assigned-row">
                      <div className="adv-assigned-info">
                        <span className="adv-course-code">{c.courseCode}</span>
                        <span className="adv-assigned-detail">Sec {c.section} · {c.time}</span>
                      </div>
                      <button
                        id={`adv-remove-${c.id}`}
                        className="adv-remove-btn"
                        onClick={() => handleRemove(c.id)}
                        title="Remove this course"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {(!profile.advisedCourses || profile.advisedCourses.length === 0) && (
                <p style={{ marginTop: 12, fontSize: 13, color: 'var(--color-text-sub)', textAlign: 'center' }}>
                  No courses assigned yet.
                </p>
              )}

              {/* Confirm Advising Action (Requirement 1) */}
              <div className="adv-confirm-section" style={{ marginTop: 18, borderTop: '1px solid var(--color-border, #E2E8F0)', paddingTop: 14 }}>
                {profile.advisingConfirmed ? (
                  <div className="adv-confirmed-banner">
                    <div className="adv-confirmed-badge-row">
                      <span className="adv-confirmed-tag">✅ Advising Confirmed</span>
                      <span className="adv-confirmed-time">
                        {profile.advisingConfirmedAt ? profile.advisingConfirmedAt.replace('T', ' ').slice(0, 19) : 'Saved in DB'}
                      </span>
                    </div>
                    <button
                      id="adv-confirm-btn"
                      className="adv-confirm-btn adv-confirm-btn--secondary"
                      disabled={confirming || !profile.advisedCourses || profile.advisedCourses.length === 0}
                      onClick={handleConfirmAdvising}
                    >
                      {confirming ? 'Saving…' : '🔄 Update & Confirm Advising'}
                    </button>
                  </div>
                ) : (
                  <button
                    id="adv-confirm-btn"
                    className="adv-confirm-btn"
                    disabled={confirming || !profile.advisedCourses || profile.advisedCourses.length === 0}
                    onClick={handleConfirmAdvising}
                  >
                    {confirming ? 'Saving to Database…' : '💾 Confirm Advising'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Right column: Tabbed Course Catalog / Student Routine ── */}
        <div className="adv-right-col">
          <div className="section-card" style={{ flex: 1 }}>
            {/* View Switcher: Catalog vs Routine */}
            <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--color-border, #E2E8F0)', paddingBottom: 12, marginBottom: 14 }}>
              <button
                className={`btn ${activeTab === 'courses' ? 'btn--primary' : 'btn--outline'}`}
                style={{ padding: '6px 14px', fontSize: 13 }}
                onClick={() => setActiveTab('courses')}
              >
                📚 Course Catalog & Add
              </button>
              <button
                className={`btn ${activeTab === 'routine' ? 'btn--primary' : 'btn--outline'}`}
                style={{ padding: '6px 14px', fontSize: 13 }}
                onClick={() => setActiveTab('routine')}
              >
                📅 Student Routine ({studentRoutine.length} classes)
              </button>
            </div>

            {activeTab === 'routine' ? (
              /* Student Routine View (Requirement 3) */
              <div>
                <div className="section-header" style={{ marginBottom: 14 }}>
                  <h2 className="section-title">
                    Weekly Class Schedule for {profile?.studentName || 'Advisee'}
                  </h2>
                  <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
                    Generated dynamically from assigned course sections
                  </span>
                </div>

                {studentRoutine.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-sub)' }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>📅</div>
                    <p>No classes scheduled yet. Assign courses from the catalog to populate the routine.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-border, #E2E8F0)', textAlign: 'left', color: 'var(--color-text-sub)' }}>
                          <th style={{ padding: '10px 12px' }}>Day</th>
                          <th style={{ padding: '10px 12px' }}>Course</th>
                          <th style={{ padding: '10px 12px' }}>Section</th>
                          <th style={{ padding: '10px 12px' }}>Time</th>
                          <th style={{ padding: '10px 12px' }}>Room</th>
                          <th style={{ padding: '10px 12px' }}>Instructor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentRoutine.map(item => (
                          <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border, #EDF2F7)' }}>
                            <td style={{ padding: '12px', fontWeight: 600, color: 'var(--color-primary, #1A9882)' }}>
                              {item.day}
                            </td>
                            <td style={{ padding: '12px', fontWeight: 600 }}>{item.courseCode}</td>
                            <td style={{ padding: '12px' }}>Sec {item.section}</td>
                            <td style={{ padding: '12px' }}>{item.time}</td>
                            <td style={{ padding: '12px' }}>{item.room}</td>
                            <td style={{ padding: '12px', color: 'var(--color-text-sub)' }}>{item.faculty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              /* Course Catalog View */
              <div>
                <div className="section-header" style={{ marginBottom: 14 }}>
                  <h2 className="section-title">Available Courses</h2>
                  <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
                    Click Assign to add a course to the student's schedule
                  </span>
                </div>

                <div style={{ position: 'relative', marginBottom: 14 }}>
                  <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔍</span>
                  <input
                    id="adv-course-search"
                    className="adv-course-search-input"
                    placeholder="Search by code, title, section, or faculty…"
                    value={courseSearch}
                    onChange={e => setCourseSearch(e.target.value)}
                  />
                </div>

                <div className="adv-catalog-list">
                  {coursesLoading && (
                    <div style={{ padding: '12px 0' }}>
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="skeleton-line" style={{ height: 52, marginBottom: 12, borderRadius: 8 }} />
                      ))}
                    </div>
                  )}
                  {!coursesLoading && filteredCourses.length === 0 && (
                    <p style={{ marginTop: 24, fontSize: 13, color: 'var(--color-text-sub)', textAlign: 'center' }}>
                      No courses found matching your search.
                    </p>
                  )}
                  {!coursesLoading && filteredCourses.map(course => {
                    const isAssigned     = assignedCodes.has(course.code)
                    const availableSeats = (course.totalSeats || 0) - (course.booked || 0)
                    const soldOut        = availableSeats <= 0
                    const isOverenrolled = availableSeats < 0
                    const credits        = course.credits || 3
                    return (
                      <div
                        key={course.id}
                        className={`adv-catalog-row${isAssigned ? ' adv-catalog-row--assigned' : ''}`}
                        id={`adv-catalog-${course.id}`}
                      >
                        <div className="adv-catalog-info">
                          <div className="adv-catalog-top">
                            <span className="adv-course-code">{course.code}</span>
                            <span className="adv-catalog-section">Sec {course.section}</span>
                            {isOverenrolled ? (
                              <span className="adv-soldout-badge" style={{ background: '#FEE2E2', color: '#DC2626', fontWeight: 700 }}>
                                Overenrolled ({availableSeats})
                              </span>
                            ) : soldOut ? (
                              <span className="adv-soldout-badge">Full</span>
                            ) : null}
                            {isAssigned && <span className="adv-already-badge">✓ Assigned</span>}
                          </div>
                          <div className="adv-catalog-title">{course.title}</div>
                          <div className="adv-catalog-meta">
                            📅 {course.time} &nbsp;|&nbsp; 📍 {course.room} &nbsp;|&nbsp; 👤 {course.faculty}
                          </div>
                          <div className="adv-catalog-meta" style={{ color: isOverenrolled ? '#DC2626' : undefined, fontWeight: isOverenrolled ? 600 : undefined }}>
                            🪑 {availableSeats} seat{availableSeats !== 1 ? 's' : ''} left · {credits} credit{credits !== 1 ? 's' : ''}
                          </div>
                        </div>
                        <button
                          id={`adv-assign-${course.id}`}
                          className="adv-assign-btn"
                          disabled={isAssigned || !profile || courseCount >= courseLimit || soldOut}
                          onClick={() => handleAssign(course)}
                          title={isAssigned ? 'Already assigned' : soldOut ? 'Section full' : courseCount >= courseLimit ? 'Course limit reached' : 'Assign this course'}
                        >
                          {isAssigned ? '✓' : 'Assign'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className={`advising-toast${toastType === 'error' ? ' advising-toast--error' : ''}`}
          role="alert"
          aria-live="assertive"
        >
          {toastType === 'error' ? '❌ ' : '✅ '}{toast}
        </div>
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   4. ADMIN ADVISING PANEL (Section Creator & Bypass Enrolment)
═══════════════════════════════════════════════════════════════ */
function AdminAdvisingPanel() {
  const [adminTab, setAdminTab] = useState('advising') // 'advising' | 'create-section' | 'force-register'
  const advisorCtrl = useAdvisorController()

  const {
    sectionForm,
    creatingSection,
    handleSectionFieldChange,
    handleCreateSection,
    bypassForm,
    enrollingBypass,
    handleBypassFieldChange,
    handleForceRegister,
    toast,
    toastType,
  } = useAdminAdvisingController({
    onSectionCreated: () => {
      advisorCtrl.refreshCourses()
    },
    onStudentEnrolled: (res) => {
      if (res && res.studentId) {
        advisorCtrl.handleSelectStudent(res.studentId)
      }
      advisorCtrl.refreshCourses()
    }
  })

  return (
    <>
      <div className="dashboard-header" style={{ marginBottom: 16 }}>
        <div>
          <h1 className="dashboard-greeting">Admin Advising & Section Management 🛡️</h1>
          <p className="dashboard-date">Create new course sections, manage advisees, and bypass seat limits</p>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, borderBottom: '2px solid var(--color-border, #E2E8F0)', paddingBottom: 10 }}>
        <button
          className={`btn ${adminTab === 'advising' ? 'btn--primary' : 'btn--outline'}`}
          onClick={() => setAdminTab('advising')}
        >
          🧑‍🏫 Student Advising & Routine
        </button>
        <button
          id="admin-tab-create-section"
          className={`btn ${adminTab === 'create-section' ? 'btn--primary' : 'btn--outline'}`}
          onClick={() => setAdminTab('create-section')}
        >
          ➕ Create Course Section
        </button>
        <button
          id="admin-tab-force-register"
          className={`btn ${adminTab === 'force-register' ? 'btn--primary' : 'btn--outline'}`}
          onClick={() => setAdminTab('force-register')}
        >
          ⚡ Force Enrolment (Bypass Seat Limit)
        </button>
      </div>

      {/* Tab 1: Normal Advising & Routines */}
      {adminTab === 'advising' && <AdvisorPanel isAdmin={true} advisorCtrl={advisorCtrl} />}

      {/* Tab 2: Create Course Section Form (Requirement 4) */}
      {adminTab === 'create-section' && (
        <div className="section-card" style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="section-header" style={{ marginBottom: 18 }}>
            <h2 className="section-title">Create New Course Section</h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-sub)' }}>
              Add a brand new section to the university course catalog.
            </p>
          </div>

          <form onSubmit={handleCreateSection} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Course Code *</label>
              <input
                id="sec-input-code"
                className="adv-course-search-input"
                placeholder="e.g. CSE220"
                value={sectionForm.code}
                onChange={e => handleSectionFieldChange('code', e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Section Number *</label>
              <input
                id="sec-input-section"
                className="adv-course-search-input"
                placeholder="e.g. 05"
                value={sectionForm.section}
                onChange={e => handleSectionFieldChange('section', e.target.value)}
                required
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Course Title</label>
              <input
                id="sec-input-title"
                className="adv-course-search-input"
                placeholder="e.g. DATA STRUCTURES"
                value={sectionForm.title}
                onChange={e => handleSectionFieldChange('title', e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Instructor / Faculty</label>
              <input
                id="sec-input-faculty"
                className="adv-course-search-input"
                placeholder="e.g. Dr. Sadia Rahman (SDR)"
                value={sectionForm.faculty}
                onChange={e => handleSectionFieldChange('faculty', e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Classroom / Lab</label>
              <input
                id="sec-input-room"
                className="adv-course-search-input"
                placeholder="e.g. UB08A-04C"
                value={sectionForm.room}
                onChange={e => handleSectionFieldChange('room', e.target.value)}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Schedule / Time Slots</label>
              <input
                id="sec-input-time"
                className="adv-course-search-input"
                placeholder="e.g. SUNDAY(8:00 AM-9:20 AM-08A-04C) ; TUESDAY(8:00 AM-9:20 AM-08A-04C)"
                value={sectionForm.time}
                onChange={e => handleSectionFieldChange('time', e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Total Seat Capacity</label>
              <input
                id="sec-input-seats"
                type="number"
                min="1"
                max="200"
                className="adv-course-search-input"
                value={sectionForm.totalSeats}
                onChange={e => handleSectionFieldChange('totalSeats', e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Credits</label>
              <input
                id="sec-input-credits"
                type="number"
                step="0.5"
                min="1"
                max="6"
                className="adv-course-search-input"
                value={sectionForm.credits}
                onChange={e => handleSectionFieldChange('credits', e.target.value)}
              />
            </div>

            <div style={{ gridColumn: 'span 2', marginTop: 8 }}>
              <button
                id="sec-submit-btn"
                type="submit"
                className="btn btn--primary"
                style={{ width: '100%', padding: '10px 16px', fontWeight: 600 }}
                disabled={creatingSection}
              >
                {creatingSection ? 'Creating Section…' : '✨ Create Section'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Force Enrolment Bypass (Requirement 4) */}
      {adminTab === 'force-register' && (
        <div className="section-card" style={{ maxWidth: 640, margin: '0 auto' }}>
          <div className="section-header" style={{ marginBottom: 18 }}>
            <h2 className="section-title">⚡ Force Enrolment (Bypass Seat Limit)</h2>
            <p style={{ fontSize: 13, color: 'var(--color-text-sub)' }}>
              Over-enroll a student into a full section or bypass registration restrictions.
            </p>
          </div>

          <div style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 8,
            padding: '12px 16px',
            fontSize: 13,
            color: '#DC2626',
            marginBottom: 20
          }}>
            ⚠️ <strong>Admin Authority:</strong> This action will register the student even if the section has 0 remaining seats (booked &gt;= totalSeats).
          </div>

          <form onSubmit={handleForceRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Student User ID *</label>
              <input
                id="bypass-student-id"
                className="adv-course-search-input"
                placeholder="e.g. STU001"
                value={bypassForm.studentId}
                onChange={e => handleBypassFieldChange('studentId', e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Section ID *</label>
              <input
                id="bypass-section-id"
                className="adv-course-search-input"
                placeholder="e.g. CSE110-01 or MKT301-01"
                value={bypassForm.sectionId}
                onChange={e => handleBypassFieldChange('sectionId', e.target.value)}
                required
              />
            </div>

            <button
              id="bypass-submit-btn"
              type="submit"
              className="btn btn--primary"
              style={{
                marginTop: 8,
                padding: '10px 16px',
                fontWeight: 600,
                background: '#DC2626',
                borderColor: '#DC2626'
              }}
              disabled={enrollingBypass}
            >
              {enrollingBypass ? 'Enrolling with Bypass…' : '⚡ Force Enrol Student'}
            </button>
          </form>
        </div>
      )}

      {/* Toast alert */}
      {toast && (
        <div
          className={`advising-toast${toastType === 'error' ? ' advising-toast--error' : ''}`}
          role="alert"
          aria-live="assertive"
        >
          {toastType === 'error' ? '❌ ' : '✅ '}{toast}
        </div>
      )}
    </>
  )
}

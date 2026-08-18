import Sidebar from '../components/Sidebar.jsx'
import { useAdvisorController } from '../../controllers/advisingController.js'
import { STATIC_COURSES } from '../../models/routineModel.js'
import RegistrationSection from './RegistrationView.jsx'

/**
 * AdvisingView – Dual-role advising page.
 *
 * MVC Role: View
 * - If userRole === 'advisor': renders the Advisor Assignment Panel
 * - Otherwise (student):       renders the Student Course View
 */
export default function AdvisingView() {
  const role = localStorage.getItem('userRole') || 'student'
  const isAdvisor = role === 'advisor'

  return (
    <div className="dashboard-wrapper">
      <Sidebar activeItem="advising" />
      <main className="dashboard-main">
        {isAdvisor ? <AdvisorPanel /> : <StudentPanel />}
      </main>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   STUDENT PANEL
   Shows ONLY the Course Registration feature.
   No advising info, no assigned courses, no message advisor button.
═══════════════════════════════════════════════════════════════ */
function StudentPanel() {
  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">Advising 🎓</h1>
          <p className="dashboard-date">Browse open sections and register during your advising window</p>
        </div>
      </div>
      <RegistrationSection />
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ADVISOR PANEL
═══════════════════════════════════════════════════════════════ */
function AdvisorPanel() {
  const {
    students, selectedStudent, profile,
    courseSearch, setCourseSearch,
    loading, profileLoading,
    toast, toastType,
    creditUsed, creditLimit, courseCount, courseLimit,
    seatUpdates,
    handleSelectStudent,
    handleAssign,
    handleRemove,
  } = useAdvisorController()

  // Filter STATIC_COURSES by search and exclude already-assigned codes
  const assignedCodes = new Set(profile?.advisedCourses?.map(c => c.courseCode) ?? [])
  const filteredCourses = STATIC_COURSES.filter(c => {
    const q = courseSearch.toLowerCase()
    const matchesSearch = !q || c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.section.includes(q)
    return matchesSearch
  })

  const creditPct = creditLimit > 0 ? Math.round((creditUsed / creditLimit) * 100) : 0

  return (
    <>
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-greeting">Advisor Panel 🧑‍🏫</h1>
          <p className="dashboard-date">Assign and manage course schedules for your advisees</p>
        </div>
      </div>

      <div className="adv-advisor-layout">
        {/* ── Left column: Student profile ── */}
        <div className="adv-left-col">
          {/* Student selector */}
          <div className="section-card">
            <h2 className="section-title" style={{ marginBottom: 12 }}>Select Student</h2>
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
                  <div className="adv-assigned-header">Assigned Courses</div>
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
            </div>
          )}
        </div>

        {/* ── Right column: Course catalog ── */}
        <div className="adv-right-col">
          <div className="section-card" style={{ flex: 1 }}>
            <div className="section-header" style={{ marginBottom: 14 }}>
              <h2 className="section-title">Course Catalog</h2>
              <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
                Click Assign to add a course to the student's schedule
              </span>
            </div>

            <div style={{ position: 'relative', marginBottom: 14 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔍</span>
              <input
                id="adv-course-search"
                className="adv-course-search-input"
                placeholder="Search by code, title, or section…"
                value={courseSearch}
                onChange={e => setCourseSearch(e.target.value)}
              />
            </div>

            <div className="adv-catalog-list">
              {filteredCourses.map(course => {
                const isAssigned     = assignedCodes.has(course.code)
                // Subtract additional bookings made through the advisor panel this session
                const extraBooked    = seatUpdates[course.id] ?? 0
                const availableSeats = Math.max(0, course.totalSeats - course.booked - extraBooked)
                const soldOut        = availableSeats <= 0
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
                        {soldOut && <span className="adv-soldout-badge">Full</span>}
                        {isAssigned && <span className="adv-already-badge">✓ Assigned</span>}
                      </div>
                      <div className="adv-catalog-title">{course.title}</div>
                      <div className="adv-catalog-meta">
                        📅 {course.time} &nbsp;|&nbsp; 📍 {course.room} &nbsp;|&nbsp; 👤 {course.faculty}
                      </div>
                      <div className="adv-catalog-meta">
                        🪑 {availableSeats} seat{availableSeats !== 1 ? 's' : ''} left · 3 credits
                      </div>
                    </div>
                    <button
                      id={`adv-assign-${course.id}`}
                      className="adv-assign-btn"
                      disabled={isAssigned || !profile || courseCount >= courseLimit}
                      onClick={() => handleAssign(course)}
                      title={isAssigned ? 'Already assigned' : courseCount >= courseLimit ? 'Course limit reached' : 'Assign this course'}
                    >
                      {isAssigned ? '✓' : 'Assign'}
                    </button>
                  </div>
                )
              })}
            </div>
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

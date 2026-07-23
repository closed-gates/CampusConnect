import Sidebar  from '../components/Sidebar'
import StatCard  from '../components/StatCard'

/**
 * DashboardPage
 *
 * Fully static placeholder shell. All data is hardcoded.
 *
 * Collaborator integration points (marked with TODO):
 *   - Courses section   → wire to GET /api/courses/enrolled
 *   - Routine section   → wire to GET /api/schedule/weekly
 *   - Attendance        → wire to GET /api/attendance/summary
 *   - Continue Learning → wire to GET /api/courses/in-progress
 *   - Recommended       → wire to GET /api/courses/recommended
 *   - User greeting     → pull username from JWT / user context
 */

/* ── Static placeholder data ─────────────────────────────── */
const CONTINUE_LEARNING = [
  {
    id: 1,
    icon: '📐',
    iconBg: '#E8F4FD',
    name: 'Engineering Mathematics',
    meta: 'Year 2 · 3 Credits',
    progress: 65,
    status: 'In Progress',
  },
  {
    id: 2,
    icon: '💻',
    iconBg: '#F0FDF4',
    name: 'Data Structures & Algorithms',
    meta: 'Year 2 · 3 Credits',
    progress: 40,
    status: 'In Progress',
  },
  {
    id: 3,
    icon: '🔬',
    iconBg: '#FFF7ED',
    name: 'Physics for Engineers',
    meta: 'Year 1 · 4 Credits',
    progress: 100,
    status: 'Completed',
  },
]



/* ── Component ───────────────────────────────────────────── */
export default function DashboardPage() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <Sidebar activeItem="home" />

      {/* Main content */}
      <main className="dashboard-main" aria-label="Dashboard main content">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-greeting">
            {/* TODO (Phase 2): replace "Student" with authenticated user's name */}
            Welcome back, Student! 👋
          </h1>
          <p className="dashboard-date">{today}</p>
        </div>

        {/* ── Stat Cards ─────────────────────────────── */}
        <div className="stat-cards-row">
          {/*
           * TODO (Phase 2): Replace hardcoded values with API data
           * GET /api/courses/enrolled  → count
           * GET /api/schedule/weekly   → classes/week
           * GET /api/attendance/summary → percentage
           */}
          <StatCard
            icon="🎓"
            iconColor="teal"
            value="6"
            label="Enrolled Courses"
            linkText="View details"
            isActive
          />
          <StatCard
            icon="📅"
            iconColor="purple"
            value="18"
            label="Classes This Week (Routine)"
            linkText="View schedule"
          />
          <StatCard
            icon="✅"
            iconColor="orange"
            value="87%"
            label="Attendance Metrics"
            linkText="View report"
          />
        </div>

        {/* ── Continue Learning ───────────────────────── */}
        <div className="section-card">
          <div className="section-header">
            <h2 className="section-title">Continue Learning</h2>
            {/* TODO: link to /courses */}
            <button className="section-see-all">See All</button>
          </div>

          <table className="learning-table">
            <thead>
              <tr>
                <th style={{ width: '40%' }}>Course Name</th>
                <th style={{ width: '35%' }}>Progress</th>
                <th style={{ width: '25%' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {CONTINUE_LEARNING.map(course => (
                <tr key={course.id}>
                  {/* Course name */}
                  <td>
                    <div className="course-name-cell">
                      <div
                        className="course-icon"
                        style={{ background: course.iconBg }}
                        aria-hidden="true"
                      >
                        {course.icon}
                      </div>
                      <div>
                        <div className="course-name">{course.name}</div>
                        <div className="course-meta">{course.meta}</div>
                      </div>
                    </div>
                  </td>

                  {/* Progress bar */}
                  <td>
                    <div className="progress-cell">
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${course.progress}%` }}
                          role="progressbar"
                          aria-valuenow={course.progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                      <span className="progress-pct">{course.progress}%</span>
                    </div>
                  </td>

                  {/* Status badge */}
                  <td>
                    <span className={`status-badge ${course.status === 'Completed' ? 'completed' : 'in-progress'}`}>
                      {course.status === 'Completed' ? '✓' : '⏳'} {course.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


      </main>
    </div>
  )
}

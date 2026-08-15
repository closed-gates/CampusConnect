import Sidebar from '../components/Sidebar.jsx'
import StatCard from '../components/StatCard.jsx'
import { useDashboardController } from '../../controllers/dashboardController.js'

/**
 * DashboardView – View layer for the Dashboard page.
 *
 * MVC Role: View
 * Renders the dashboard layout. All data is provided by useDashboardController().
 */
export default function DashboardView() {
  const { today, continueLearning, stats } = useDashboardController()

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
            Welcome back, Student!
          </h1>
          <p className="dashboard-date">{today}</p>
        </div>

        {/* ── Stat Cards ─────────────────────────────── */}
        <div className="stat-cards-row">
          {stats.map((stat, idx) => (
            <StatCard
              key={idx}
              icon={stat.icon}
              iconColor={stat.iconColor}
              value={stat.value}
              label={stat.label}
              linkText={stat.linkText}
              isActive={stat.isActive}
            />
          ))}
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
              {continueLearning.map(course => (
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

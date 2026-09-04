import React from 'react'
import Sidebar from '../components/Sidebar.jsx'
import StatCard from '../components/StatCard.jsx'
import ExamScheduleWidget from '../components/ExamScheduleWidget.jsx'
import EnrolledCoursesModal from '../components/EnrolledCoursesModal.jsx'
import StudentRoutineModal from '../components/StudentRoutineModal.jsx'
import StudentAttendanceModal from '../components/StudentAttendanceModal.jsx'
import NotificationBell from '../components/Notifications/NotificationBell.jsx'
import { useDashboardController } from '../../controllers/dashboardController.js'
import { getStoredUser } from '../../models/authModel.js'

/**
 * DashboardView – View layer for the Dashboard page.
 *
 * MVC Role: View
 * Renders the dashboard layout. All data is provided by useDashboardController().
 */
export default function DashboardView() {
  const {
    today,
    fullName,
    stats,
    courses,
    attendanceReport,
    weeklyClassCount,
    routineGrid,
    activeModal,
    closeModal,
    showUpcomingExams,
  } = useDashboardController()

  const currentUser = getStoredUser()
  const isStudent = !currentUser?.role || currentUser?.role?.toUpperCase() === 'STUDENT'

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <Sidebar activeItem="home" />

      {/* Main content */}
      <main className="dashboard-main" aria-label="Dashboard main content">
        {/* Header */}
        <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="dashboard-greeting">
              Welcome back, {fullName}!
            </h1>
            <p className="dashboard-date">{today}</p>
          </div>

          {/* Real-time In-App Notification Bell strictly for student users */}
          {isStudent && <NotificationBell user={currentUser} />}
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
              onLinkClick={stat.onClick}
            />
          ))}
        </div>

        {/* ── Upcoming Exams Widget ─────────────────── */}
        {showUpcomingExams && <ExamScheduleWidget />}

        {/* ── Interactive Modals ────────────────────── */}
        <EnrolledCoursesModal
          isOpen={activeModal === 'details'}
          onClose={closeModal}
          courses={courses}
        />

        <StudentRoutineModal
          isOpen={activeModal === 'routine'}
          onClose={closeModal}
          courses={courses}
          routineGrid={routineGrid}
          weeklyClassCount={weeklyClassCount}
        />

        {isStudent && <StudentAttendanceModal
          isOpen={activeModal === 'attendance'}
          onClose={closeModal}
          attendanceData={attendanceReport}
        />}
      </main>
    </div>
  )
}

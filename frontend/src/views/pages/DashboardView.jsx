import React from 'react'
import Sidebar from '../components/Sidebar.jsx'
import StatCard from '../components/StatCard.jsx'
import ExamScheduleWidget from '../components/ExamScheduleWidget.jsx'
import EnrolledCoursesModal from '../components/EnrolledCoursesModal.jsx'
import StudentRoutineModal from '../components/StudentRoutineModal.jsx'
import StudentAttendanceModal from '../components/StudentAttendanceModal.jsx'
import { useDashboardController } from '../../controllers/dashboardController.js'

/**
 * DashboardView – View layer for the Dashboard page.
 *
 * MVC Role: View
 * Renders the dashboard layout. All data is provided by useDashboardController().
 */
export default function DashboardView() {
  const {
    today,
    stats,
    courses,
    attendanceReport,
    weeklyClassCount,
    routineGrid,
    activeModal,
    closeModal,
  } = useDashboardController()

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <Sidebar activeItem="home" />

      {/* Main content */}
      <main className="dashboard-main" aria-label="Dashboard main content">
        {/* Header */}
        <div className="dashboard-header">
          <h1 className="dashboard-greeting">
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
              onLinkClick={stat.onClick}
            />
          ))}
        </div>

        {/* ── Upcoming Exams Widget ─────────────────── */}
        <ExamScheduleWidget />

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

        <StudentAttendanceModal
          isOpen={activeModal === 'attendance'}
          onClose={closeModal}
          attendanceData={attendanceReport}
        />
      </main>
    </div>
  )
}

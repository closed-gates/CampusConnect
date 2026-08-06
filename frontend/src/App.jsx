import { Routes, Route, Navigate } from 'react-router-dom'

// ── MVC: View layer (pages) ──────────────────────────────────
import LoginView            from './views/pages/LoginView'
import SignupView           from './views/pages/SignupView'
import DashboardView        from './views/pages/DashboardView'
import AcademicCalendarView from './views/pages/AcademicCalendarView'
import MessagingView        from './views/pages/MessagingView'
import ClubActivitiesView   from './views/pages/ClubActivitiesView'
import CoursesView          from './views/pages/CoursesView'
import RoutineView          from './views/pages/RoutineView'
import AttendanceView       from './views/pages/AttendanceView'
import AdvisingView        from './views/pages/AdvisingView'

/**
 * App – Root router
 *
 * MVC Role: Application entry-point (wires routes to Views)
 *
 * Routes:
 *   /                   → LoginView
 *   /signup             → SignupView
 *   /dashboard          → DashboardView
 *   /club-activities    → ClubActivitiesView   ← Phase 2 (Arham)
 *   /academic-calendar  → AcademicCalendarView
 *   /messaging          → MessagingView
 *   /courses            → CoursesView
 *   /routine            → RoutineView
 *   /attendance         → AttendanceView        ← Phase 2 (Arham)
 *   *                   → redirect to /
 *
 * NOTE (Phase 3): Replace the wildcard redirect with a
 * ProtectedRoute component that checks for a valid JWT token.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/"                  element={<LoginView />} />
      <Route path="/signup"            element={<SignupView />} />
      <Route path="/dashboard"         element={<DashboardView />} />
      <Route path="/academic-calendar" element={<AcademicCalendarView />} />
      <Route path="/messaging"         element={<MessagingView />} />
      <Route path="/club-activities"   element={<ClubActivitiesView />} />
      <Route path="/courses"           element={<CoursesView />} />
      <Route path="/routine"           element={<RoutineView />} />
      <Route path="/attendance"        element={<AttendanceView />} />
      <Route path="/advising"          element={<AdvisingView />} />
      {/* Catch-all */}
      <Route path="*"                  element={<Navigate to="/" replace />} />
    </Routes>
  )
}

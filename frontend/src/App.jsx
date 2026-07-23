import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage             from './pages/LoginPage'
import SignupPage            from './pages/SignupPage'
import DashboardPage         from './pages/DashboardPage'
import AcademicCalendarPage  from './pages/AcademicCalendarPage'
import MessagingPage         from './pages/MessagingPage'
import ClubActivitiesPage    from './pages/ClubActivitiesPage'
import CoursesPage           from './pages/CoursesPage'

/**
 * App – Root router
 *
 * Routes:
 *   /                   → LoginPage
 *   /signup             → SignupPage
 *   /dashboard          → DashboardPage
 *   /academic-calendar  → AcademicCalendarPage
 *   /messaging          → MessagingPage
 *   *                   → redirect to /
 *   /                → LoginPage
 *   /signup          → SignupPage
 *   /dashboard       → DashboardPage
 *   /club-activities → ClubActivitiesPage  ← Phase 2
 *   *                → redirect to /
 *
 * NOTE (Phase 3): Replace the wildcard redirect with a
 * ProtectedRoute component that checks for a valid JWT token.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/"                  element={<LoginPage />} />
      <Route path="/signup"            element={<SignupPage />} />
      <Route path="/dashboard"         element={<DashboardPage />} />
      <Route path="/academic-calendar" element={<AcademicCalendarPage />} />
      <Route path="/messaging"         element={<MessagingPage />} />
      <Route path="/club-activities"   element={<ClubActivitiesPage />} />
      <Route path="/courses"           element={<CoursesPage />} />
      {/* Catch-all */}
      <Route path="*"                element={<Navigate to="/" replace />} />
    </Routes>
  )
}

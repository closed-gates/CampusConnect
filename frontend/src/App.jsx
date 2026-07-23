import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage    from './pages/LoginPage'
import SignupPage   from './pages/SignupPage'
import DashboardPage from './pages/DashboardPage'
import AcademicCalendarPage from './pages/AcademicCalendarPage'

/**
 * App – Root router
 *
 * Routes:
 *   /                   → LoginPage
 *   /signup             → SignupPage
 *   /dashboard          → DashboardPage
 *   /academic-calendar  → AcademicCalendarPage
 *   *                   → redirect to /
 *
 * NOTE (Phase 2): Replace the wildcard redirect with a
 * ProtectedRoute component that checks for a valid JWT token.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/"                  element={<LoginPage />} />
      <Route path="/signup"            element={<SignupPage />} />
      <Route path="/dashboard"         element={<DashboardPage />} />
      <Route path="/academic-calendar" element={<AcademicCalendarPage />} />
      {/* Catch-all */}
      <Route path="*"                  element={<Navigate to="/" replace />} />
    </Routes>
  )
}

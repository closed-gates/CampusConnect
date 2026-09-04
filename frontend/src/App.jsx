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
import AdvisingView         from './views/pages/AdvisingView'
import AssignAdvisorView   from './views/pages/AssignAdvisorView'
import BypassCourseView    from './views/pages/BypassCourseView'
import ViewRoutineView     from './views/pages/ViewRoutineView'
import AssignmentView       from './views/pages/AssignmentView'
import PaymentView          from './views/pages/PaymentView'
import GpaView             from './views/pages/GpaView'
import AccountSettingsView from './views/pages/AccountSettingsView'
import FacultyDirectoryView from './views/pages/FacultyDirectoryView'
import VideoLectureView    from './views/pages/VideoLectureView'
import CourseMaterialView  from './views/pages/CourseMaterialView'

// ── Route guard ──────────────────────────────────────────────
import ProtectedRoute       from './views/components/ProtectedRoute'
import { getStoredUser }    from './models/authModel'
import { usePreferencesBootstrapController } from './controllers/preferencesController'

/** Guard: only students can access */
function StudentOnlyRoute({ children }) {
  const user = getStoredUser()
  const isStudent = !user?.role || user?.role === 'STUDENT'
  return isStudent ? children : <Navigate to="/dashboard" replace />
}

/** Guard: faculty cannot access (students and admins allowed) */
function NonFacultyRoute({ children }) {
  const user = getStoredUser()
  const isFaculty = user?.role === 'FACULTY'
  return !isFaculty ? children : <Navigate to="/dashboard" replace />
}

/**
 * App – Root router
 *
 * MVC Role: Application entry-point (wires routes to Views)
 *
 * Public routes (no login required):
 *   /         → LoginView
 *   /signup   → SignupView
 *
 * Protected routes (redirect to / if no valid JWT):
 *   All other routes are nested inside <ProtectedRoute>
 */
export default function App() {
  usePreferencesBootstrapController()

  return (
    <Routes>
      {/* ── Public routes ──────────────────────────── */}
      <Route path="/"       element={<LoginView />} />
      <Route path="/signup" element={<SignupView />} />

      {/* ── Protected routes (require valid JWT) ──── */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard"         element={<DashboardView />} />
        <Route path="/academic-calendar" element={<AcademicCalendarView />} />
        <Route path="/messaging"         element={<MessagingView />} />
        <Route path="/club-activities"   element={<NonFacultyRoute><ClubActivitiesView /></NonFacultyRoute>} />
        <Route path="/courses"           element={<CoursesView />} />
        <Route path="/routine"           element={<StudentOnlyRoute><RoutineView /></StudentOnlyRoute>} />
        <Route path="/attendance"        element={<AttendanceView />} />
        <Route path="/advising"          element={<AdvisingView />} />
        <Route path="/view-routine"      element={<ViewRoutineView />} />
        <Route path="/assign-advisor"    element={<AssignAdvisorView />} />
        <Route path="/bypass-course"     element={<BypassCourseView />} />
        <Route path="/assignments"       element={<AssignmentView />} />
        <Route path="/payments"          element={<NonFacultyRoute><PaymentView /></NonFacultyRoute>} />
        <Route path="/gpa-calculator"    element={<GpaView />} />
        <Route path="/settings"          element={<AccountSettingsView />} />
        <Route path="/faculty-directory" element={<FacultyDirectoryView />} />
        <Route path="/video-lectures"    element={<VideoLectureView />} />
        <Route path="/course-materials"  element={<CourseMaterialView />} />
      </Route>

      {/* ── Catch-all → login ──────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

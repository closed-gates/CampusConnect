import { useNavigate } from 'react-router-dom'
import { createLogoutHandler } from '../../controllers/authController.js'
import { getStoredUser, ROLE_LABELS } from '../../models/authModel.js'

/**
 * Sidebar – View layer component for the main navigation.
 *
 * MVC Role: View (shared component)
 *
 * Shows logged-in user info at the top (name + role badge).
 * Logout calls createLogoutHandler which clears the JWT + navigates to login.
 */

const NAV_ITEMS = [
  { id: 'home',              label: 'Home',             icon: <HomeIcon />,      route: '/dashboard' },
  { id: 'courses',           label: 'Courses',           icon: <CoursesIcon />,   route: '/courses' },
  { id: 'faculty-directory', label: 'Faculty Directory', icon: <DirectoryIcon />, route: '/faculty-directory' },
  { id: 'assignments',       label: 'Assignments',       icon: <AssignmentIcon />, route: '/assignments' },
  { id: 'video-lectures',    label: 'Video Lectures',    icon: <VideoLectureIcon />, route: '/video-lectures' },
  { id: 'course-materials',  label: 'Course Materials',  icon: <CourseMaterialIcon />, route: '/course-materials' },
  { id: 'advising',          label: 'Advising',          icon: <AdvisingIcon />,  route: '/advising' },
  { id: 'messaging',         label: 'Messaging Board',   icon: <MessagingIcon />, route: '/messaging' },
  { id: 'academic-calendar', label: 'Academic Calendar', icon: <CalendarIcon />,  route: '/academic-calendar' },
  { id: 'clubs',             label: 'Club Activities',   icon: <ClubIcon />,      route: '/club-activities' },
  { id: 'routine',           label: 'Create Routine',    icon: <RoutineIcon />,   route: '/routine' },
  { id: 'attendance',        label: 'Attendance',        icon: <AttendanceIcon />, route: '/attendance' },
  { id: 'payments',          label: 'Payments',          icon: <PaymentIcon />,    route: '/payments' },
]

export default function Sidebar({ activeItem = 'home' }) {
  const navigate    = useNavigate()
  const handleLogout = createLogoutHandler(navigate)
  const user        = getStoredUser()

  const roleLabel = user?.role ? (ROLE_LABELS[user.role] || user.role) : ''
  const isAdmin   = user?.role === 'ADMIN'
  const isFaculty = user?.role === 'FACULTY'
  const isStudent = !user?.role || user?.role === 'STUDENT'

  // Build nav items dynamically: include "View Routine" below Advising for students, and Admin tools
  const navItems = []
  NAV_ITEMS.forEach(item => {
    // Access control:
    // 1. Create Routine is student-only (hidden from admin and faculty)
    if (item.id === 'routine' && !isStudent) {
      return
    }
    // 2. Payments tab is hidden from faculty (visible to students and admins)
    if (item.id === 'payments' && isFaculty) {
      return
    }

    navItems.push(item)
    if (item.id === 'advising' && isStudent) {
      navItems.push({
        id: 'view-routine',
        label: 'View Routine',
        icon: <ViewRoutineIcon />,
        route: '/view-routine'
      })
    }
  })

  // Student-only: GPA Calculator
  if (isStudent) {
    navItems.push({
      id: 'gpa-calculator',
      label: 'Calculate GPA',
      icon: <GpaIcon />,
      route: '/gpa-calculator'
    })
  }

  if (isAdmin) {
    navItems.push({
      id: 'assign-advisor',
      label: 'Assign Advisor',
      icon: <AdvisorAssignIcon />,
      route: '/assign-advisor'
    })
    navItems.push({
      id: 'bypass-course',
      label: 'Bypass Course',
      icon: <BypassCourseIcon />,
      route: '/bypass-course'
    })
  }

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🎓</div>
        <span className="sidebar-logo-text">CampusConnect</span>
      </div>

      {/* User info badge */}
      {user && (
        <div className="sidebar-user-info">
          <div className="sidebar-user-avatar">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="sidebar-user-details">
            <span className="sidebar-user-name">{user.fullName}</span>
            <span className="sidebar-user-role">{roleLabel}</span>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            id={`nav-${item.id}`}
            className={`sidebar-nav-item ${activeItem === item.id ? 'active' : ''}`}
            aria-current={activeItem === item.id ? 'page' : undefined}
            onClick={() => item.route && navigate(item.route)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom actions: Settings + Logout */}
      <div className="sidebar-bottom">
        <button
          id="nav-settings"
          className={`sidebar-nav-item ${activeItem === 'settings' ? 'active' : ''}`}
          aria-current={activeItem === 'settings' ? 'page' : undefined}
          onClick={() => navigate('/settings')}
        >
          <SettingsIcon />
          Settings
        </button>
        <button
          id="sidebar-logout-btn"
          className="sidebar-logout"
          onClick={handleLogout}
          aria-label="Logout"
        >
          <LogoutIcon />
          Logout
        </button>
      </div>
    </aside>
  )
}

/* ── SVG Icons ───────────────────────────────────────────── */
function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function CoursesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  )
}

function CourseMaterialIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

function VideoLectureIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <polygon points="10 9 16 12 10 15 10 9" fill="currentColor" stroke="none"/>
    </svg>
  )
}

function AssignmentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  )
}

function AdvisingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}

function DirectoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="4"/>
      <path d="M3 21v-2a6 6 0 0 1 12 0v2"/>
      <path d="M16 4h5M16 8h5M18 12h3"/>
    </svg>
  )
}

function MessagingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  )
}

function RoutineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <line x1="12" y1="14" x2="12" y2="18"/>
      <line x1="10" y1="16" x2="14" y2="16"/>
    </svg>
  )
}

function ClubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      <line x1="12" y1="17" x2="22" y2="17"/>
    </svg>
  )
}

function AttendanceIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="2"/>
      <line x1="9" y1="12" x2="9.01" y2="12"/>
      <line x1="13" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="16" x2="9.01" y2="16"/>
      <line x1="13" y1="16" x2="15" y2="16"/>
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

function AdvisorAssignIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  )
}

function BypassCourseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 4 15 12 5 20 5 4" />
      <line x1="19" y1="5" x2="19" y2="19" />
    </svg>
  )
}

function PaymentIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
      <line x1="1" y1="10" x2="23" y2="10"/>
      <circle cx="6.5" cy="15.5" r="1.5" fill="currentColor"/>
    </svg>
  )
}

function ViewRoutineIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function GpaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

import { useNavigate } from 'react-router-dom'

/**
 * Sidebar – View layer component for the main navigation.
 *
 * MVC Role: View (shared component)
 *
 * Nav items: Home | Courses | Bookmarks | Advising | Messaging Board
 *            | Academic Calendar | Club Activities | Create Routine
 *
 * TODO (Phase 3):
 *   - "Logout" should clear JWT from localStorage and call POST /api/auth/logout
 *   - Highlight activeItem based on current route (useLocation)
 */

const NAV_ITEMS = [
  { id: 'home',              label: 'Home',             icon: <HomeIcon />,      route: '/dashboard' },
  { id: 'courses',           label: 'Courses',           icon: <CoursesIcon />,   route: '/courses' },
  { id: 'bookmarks',         label: 'Bookmarks',         icon: <BookmarksIcon />, route: null },
  { id: 'advising',          label: 'Advising',          icon: <AdvisingIcon />,  route: '/advising' },
  { id: 'messaging',         label: 'Messaging Board',   icon: <MessagingIcon />, route: '/messaging' },
  { id: 'academic-calendar', label: 'Academic Calendar', icon: <CalendarIcon />,  route: '/academic-calendar' },
  { id: 'clubs',             label: 'Club Activities',   icon: <ClubIcon />,      route: '/club-activities' },
  { id: 'routine',           label: 'Create Routine',    icon: <RoutineIcon />,   route: '/routine' },
  { id: 'attendance',        label: 'Attendance',        icon: <AttendanceIcon />, route: '/attendance' },
]

export default function Sidebar({ activeItem = 'home' }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    /*
     * ── Phase 3 stub ──────────────────────────────────────────
     * await fetch('/api/auth/logout', { method: 'POST',
     *   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
     * })
     * localStorage.removeItem('token')
     * localStorage.removeItem('userRole')
     * ─────────────────────────────────────────────────────────
     */
    localStorage.removeItem('userRole')
    navigate('/')
  }

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">🎓</div>
        <span className="sidebar-logo-text">CampusConnect</span>
      </div>

      {/* Nav items */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => (
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

      {/* Logout */}
      <div className="sidebar-bottom">
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

function BookmarksIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
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

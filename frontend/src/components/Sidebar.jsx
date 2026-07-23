import { useNavigate } from 'react-router-dom'

/**
 * Sidebar
 *
 * Nav items: Home | Courses | Bookmarks | Advising | Messaging Board
 *
 * TODO (Phase 2 / collaborators):
 *   - Each nav item should navigate to its own route
 *   - "Logout" should clear the JWT token from localStorage
 *     and call POST /api/auth/logout before redirecting to /
 *   - Highlight activeItem based on current route (useLocation)
 */

const NAV_ITEMS = [
  { id: 'home',          label: 'Home',           icon: <HomeIcon /> },
  { id: 'courses',       label: 'Courses',         icon: <CoursesIcon /> },
  { id: 'bookmarks',     label: 'Bookmarks',       icon: <BookmarksIcon /> },
  { id: 'advising',      label: 'Advising',        icon: <AdvisingIcon /> },
  { id: 'messaging',     label: 'Messaging Board', icon: <MessagingIcon /> },
]

export default function Sidebar({ activeItem = 'home' }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    /*
     * ── Phase 2 stub ──────────────────────────────────────────
     * await fetch('/api/auth/logout', { method: 'POST',
     *   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
     * })
     * localStorage.removeItem('token')
     * ─────────────────────────────────────────────────────────
     */
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
            onClick={() => {/* TODO: navigate to item route */}}
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

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  )
}

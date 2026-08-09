import { Link } from 'react-router-dom'
import authIllustration from '../../assets/auth_illustration.png'
import { useLoginController } from '../../controllers/authController.js'

/**
 * LoginView – View layer for the Login page.
 *
 * MVC Role: View
 * Renders the login form. All logic is provided by useLoginController().
 *
 * Layout: Left = form (white) | Right = lavender illustration panel
 */
export default function LoginView() {
  const { formData, loading, handleChange, handleLogin } = useLoginController()

  return (
    <div className="auth-wrapper">
      {/* ── Form Panel (left) ─────────────────────────── */}
      <div className="auth-form-panel">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🎓</div>
          <span className="auth-logo-text">CampusConnect</span>
        </div>

        <h1 className="auth-heading">Welcome back!</h1>
        <p className="auth-subtext">
          Your entire academic life — courses, schedules, advising, and more — all in one place.
        </p>

        <form onSubmit={handleLogin} noValidate>
          {/* Username / Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">Username or Email</label>
            <input
              id="login-username"
              name="username"
              type="text"
              className="form-input"
              placeholder="Enter your username or email"
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
          </div>

          {/* Role selector – demo only, remove in Phase 3 when JWT carries role */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-role">I am a:</label>
            <select
              id="login-role"
              name="role"
              className="form-input"
              value={formData.role}
              onChange={handleChange}
              style={{ cursor: 'pointer' }}
            >
              <option value="student">🎓 Student</option>
              <option value="advisor">🧑‍🏫 Advisor</option>
              <option value="admin">🛡️ Admin (Club/Faculty)</option>
            </select>
          </div>

          {/* Remember me + Forgot password */}
          <div className="form-row">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                name="remember"
                id="login-remember"
                checked={formData.remember}
                onChange={handleChange}
              />
              Remember me
            </label>
            {/* TODO Phase 2: wire to password reset flow */}
            <span className="form-link" style={{ cursor: 'pointer' }}>Forgot password?</span>
          </div>

          {/* Primary login button */}
          <button
            id="login-btn"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Login'}
          </button>

          <div className="auth-divider">Or</div>

          {/* Social login buttons (cosmetic – Phase 2 to wire OAuth) */}
          <button type="button" className="btn btn-outline" id="login-google-btn">
            <GoogleIcon />
            Login with Google
          </button>

          <button type="button" className="btn btn-outline" id="login-facebook-btn">
            <FacebookIcon />
            Login with Facebook
          </button>
        </form>

        <p className="auth-bottom">
          Don't have an account?
          <Link to="/signup">Click here</Link>
        </p>
      </div>

      {/* ── Illustration Panel (right) ─────────────────── */}
      <div className="auth-image-panel">
        <img src={authIllustration} alt="Student studying on a stack of books" />
      </div>
    </div>
  )
}

/* ── Inline SVG icons ────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg className="social-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#1877F2" d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.885v2.27h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  )
}

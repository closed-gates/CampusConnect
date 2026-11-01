import authIllustration from '../../assets/auth_illustration.png'
import { Link } from 'react-router-dom'
import { useLoginController } from '../../controllers/authController.js'
import FrozenAccountDialog from '../components/FrozenAccountDialog.jsx'

/**
 * LoginView – View layer for the Login page.
 *
 * MVC Role: View
 * Renders the login form. All logic is provided by useLoginController().
 *
 * Accepts: userId OR email + password
 * Shows real error messages from the backend.
 */
export default function LoginView() {
  const { formData, loading, error, frozenMessage, dismissFrozenMessage, handleChange, handleLogin } = useLoginController()

  return (
    <div className="auth-wrapper">
      <FrozenAccountDialog message={frozenMessage} onClose={dismissFrozenMessage} />
      {/* ── Form Panel (left) ─────────────────────────── */}
      <div className="auth-form-panel">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon" aria-hidden="true">🎓</div>
          <span className="auth-logo-text">CampusConnect</span>
        </div>

        <h1 className="auth-heading">Welcome back!</h1>
        <p className="auth-subtext">
          Course registration, routines, assignments, advising and messages for BRAC University.
        </p>

        <form onSubmit={handleLogin} noValidate>
          {/* Error banner */}
          {error && (
            <div className="auth-error-banner" role="alert">
              ⚠️ {error}
            </div>
          )}

          {/* User ID or Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-identifier">User ID or Email</label>
            <input
              id="login-identifier"
              name="identifier"
              type="text"
              className={`form-input ${error ? 'input-error' : ''}`}
              placeholder="e.g. STU001 or student@campus.edu"
              value={formData.identifier}
              onChange={handleChange}
              autoComplete="username"
              autoFocus
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password"
              type="password"
              className={`form-input ${error ? 'input-error' : ''}`}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />
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
        </form>

        <p className="auth-bottom">
          Don't have an account?&nbsp;
          <Link to="/signup">Click here</Link>
        </p>

        {/* Default credentials hint (dev/demo only) */}
        <div className="auth-demo-hint">
          <strong>Demo accounts:</strong>&nbsp;
          STU001 / student123 &nbsp;·&nbsp;
          FAC001 / faculty123 &nbsp;·&nbsp;
          ADM001 / admin123
        </div>
      </div>

      {/* ── Illustration Panel (right) ─────────────────── */}
      <div className="auth-image-panel">
        <img src={authIllustration} alt="Student studying on a stack of books" />
      </div>
    </div>
  )
}

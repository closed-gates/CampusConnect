import { Link } from 'react-router-dom'
import authIllustration from '../../assets/auth_illustration.png'
import { useSignupController } from '../../controllers/authController.js'
import { ROLE_LABELS } from '../../models/authModel.js'

/**
 * SignupView – View layer for the Signup page.
 *
 * MVC Role: View
 * Renders the signup form. All logic is provided by useSignupController().
 *
 * Fields: fullName, userId, email, password, confirmPassword, role
 * Shows real error messages from the backend.
 */
export default function SignupView() {
  const { formData, loading, error, handleChange, handleSignup } = useSignupController()

  return (
    <div className="auth-wrapper signup">
      {/* ── Illustration Panel (left via CSS order:-1) ─── */}
      <div className="auth-image-panel">
        <img src={authIllustration} alt="Student studying surrounded by academic icons" />
      </div>

      {/* ── Form Panel (right) ────────────────────────── */}
      <div className="auth-form-panel">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">🎓</div>
          <span className="auth-logo-text">CampusConnect</span>
        </div>

        <h1 className="auth-heading">Create Account</h1>
        <p className="auth-subtext">
          Join thousands of students managing their courses, schedules, and advising — all in one place.
        </p>

        <form onSubmit={handleSignup} noValidate>
          {/* Error banner */}
          {error && (
            <div className="auth-error-banner" role="alert">
              ⚠️ {error}
            </div>
          )}

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-fullname">Full Name</label>
            <input
              id="signup-fullname"
              name="fullName"
              type="text"
              className="form-input"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          {/* User ID */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-userid">
              User ID
              <span className="form-label-hint"> (e.g. STU042, FAC012)</span>
            </label>
            <input
              id="signup-userid"
              name="userId"
              type="text"
              className="form-input"
              placeholder="Choose a unique user ID"
              value={formData.userId}
              onChange={handleChange}
              autoComplete="username"
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">Email Address</label>
            <input
              id="signup-email"
              name="email"
              type="email"
              className="form-input"
              placeholder="Enter your university email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          {/* Role */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-role">I am a:</label>
            <select
              id="signup-role"
              name="role"
              className="form-input"
              value={formData.role}
              onChange={handleChange}
              style={{ cursor: 'pointer' }}
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Minimum 6 characters"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          {/* Confirm Password */}
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label" htmlFor="signup-confirm-password">Confirm Password</label>
            <input
              id="signup-confirm-password"
              name="confirmPassword"
              type="password"
              className="form-input"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          {/* Sign Up button */}
          <button
            id="signup-btn"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-bottom">
          Already have an account?&nbsp;
          <Link to="/">Log in</Link>
        </p>
      </div>
    </div>
  )
}

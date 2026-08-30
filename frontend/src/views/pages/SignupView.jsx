import { Link } from 'react-router-dom'
import authIllustration from '../../assets/auth_illustration.png'
import { useSignupController } from '../../controllers/authController.js'

/**
 * SignupView – View layer for the Signup page.
 *
 * MVC Role: View
 * Renders the signup form. All logic is provided by useSignupController().
 *
 * Layout: Left = lavender illustration panel | Right = form (white)
 */
export default function SignupView() {
  const { formData, loading, handleChange, handleSignup } = useSignupController()

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

          {/* Username */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-username">Username</label>
            <input
              id="signup-username"
              name="username"
              type="text"
              className="form-input"
              placeholder="Choose a username"
              value={formData.username}
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

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              name="password"
              type="password"
              className="form-input"
              placeholder="Create a strong password"
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
          Already have an account?
          <Link to="/">Log in</Link>
        </p>
      </div>
    </div>
  )
}

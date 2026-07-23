import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authIllustration from '../assets/auth_illustration.png'

/**
 * SignupPage
 *
 * Layout: Left = lavender illustration panel | Right = form (white)
 * (mirrored from LoginPage)
 *
 * Behaviour (Phase 1 – no auth):
 *   - Any input is accepted
 *   - Clicking "Sign Up" navigates to /dashboard
 *
 * TODO (Phase 2):
 *   - POST to POST /api/auth/register
 *   - Store returned JWT, redirect to /dashboard
 *   - Show field-level validation errors from backend
 */
export default function SignupPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '', username: '', email: '', password: '', confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)

    /*
     * ── Phase 2 stub ──────────────────────────────────────────
     * Replace the setTimeout block below with a real API call:
     *
     * const res = await fetch('/api/auth/register', {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify({
     *     fullName: formData.fullName,
     *     username: formData.username,
     *     email: formData.email,
     *     password: formData.password,
     *   }),
     * })
     * if (!res.ok) { showErrors(await res.json()); setLoading(false); return; }
     * const data = await res.json()
     * localStorage.setItem('token', data.token)
     * ─────────────────────────────────────────────────────────
     */
    setTimeout(() => {
      setLoading(false)
      navigate('/dashboard')
    }, 600)
  }

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

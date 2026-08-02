/**
 * authController.js – Controller layer for authentication pages.
 *
 * MVC Role: Controller
 * Custom React hooks that manage auth form state and login/signup logic.
 * Used by LoginView and SignupView.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { INITIAL_LOGIN_FORM, INITIAL_SIGNUP_FORM } from '../models/authModel.js'

/**
 * useLoginController
 * Manages login form state and the submit handler.
 *
 * TODO (Phase 2): Replace the setTimeout stub with a real API call to
 *   POST /api/auth/login and store the returned JWT token.
 */
export function useLoginController() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(INITIAL_LOGIN_FORM)
  const [loading,  setLoading]  = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    /*
     * ── Phase 2 stub ──────────────────────────────────────────
     * Replace the setTimeout block below with a real API call:
     *
     * const res = await fetch('/api/auth/login', {
     *   method: 'POST',
     *   headers: { 'Content-Type': 'application/json' },
     *   body: JSON.stringify({ username: formData.username, password: formData.password }),
     * })
     * if (!res.ok) { setError('Invalid credentials'); setLoading(false); return; }
     * const data = await res.json()
     * localStorage.setItem('token', data.token)
     * ─────────────────────────────────────────────────────────
     */
    setTimeout(() => {
      setLoading(false)
      localStorage.setItem('userRole', formData.role)
      navigate('/dashboard')
    }, 600)
  }

  return { formData, loading, handleChange, handleLogin }
}

/**
 * useSignupController
 * Manages signup form state and the submit handler.
 *
 * TODO (Phase 2): Replace the setTimeout stub with a real API call to
 *   POST /api/auth/register and store the returned JWT token.
 */
export function useSignupController() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState(INITIAL_SIGNUP_FORM)
  const [loading,  setLoading]  = useState(false)

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

  return { formData, loading, handleChange, handleSignup }
}

/**
 * handleLogout
 * Clears session data and redirects to login.
 * Called directly from Sidebar.
 *
 * TODO (Phase 3): Clear JWT and call POST /api/auth/logout before navigating.
 */
export function createLogoutHandler(navigate) {
  return () => {
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
}

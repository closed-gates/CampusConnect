/**
 * authController.js – Controller layer for authentication pages.
 *
 * MVC Role: Controller
 *
 * Hooks:
 *   useLoginController  → manages login form + real API call to POST /api/auth/login
 *   useSignupController → manages signup form + real API call to POST /api/auth/register
 *   createLogoutHandler → clears all auth data and redirects to login
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  INITIAL_LOGIN_FORM,
  INITIAL_SIGNUP_FORM,
  storeAuth,
  clearAuth,
} from '../models/authModel.js'

const AUTH_API = '/api/auth'

// ── Login Controller ──────────────────────────────────────────────────────────

/**
 * useLoginController
 * Manages login form state and submits credentials to the real backend API.
 */
export function useLoginController() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState(INITIAL_LOGIN_FORM)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [frozenMessage, setFrozenMessage] = useState('')

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (error) setError('')   // Clear error on typing
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    // Basic client-side validation
    if (!formData.identifier.trim()) {
      setError('Please enter your User ID or email.')
      return
    }
    if (!formData.password) {
      setError('Please enter your password.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${AUTH_API}/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          identifier: formData.identifier.trim(),
          password:   formData.password,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        const message = data.message || 'Login failed. Please check your credentials.'
        if (message.startsWith('ACCOUNT_FROZEN:')) {
          setFrozenMessage(message.replace('ACCOUNT_FROZEN:', '').trim())
        } else {
          setError(message)
        }
        return
      }

      // Persist JWT and user info to localStorage
      storeAuth(data)
      navigate('/dashboard')

    } catch (err) {
      console.error('[authController] Login error:', err)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return { formData, loading, error, frozenMessage, dismissFrozenMessage: () => setFrozenMessage(''), handleChange, handleLogin }
}

// ── Signup Controller ─────────────────────────────────────────────────────────

/**
 * useSignupController
 * Manages signup form state and submits new user data to POST /api/auth/register.
 */
export function useSignupController() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState(INITIAL_SIGNUP_FORM)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (!formData.fullName.trim()) { setError('Full name is required.'); return }
    if (!formData.userId.trim())   { setError('User ID is required.'); return }
    if (!formData.email.trim())    { setError('Email is required.'); return }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${AUTH_API}/register`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          fullName: formData.fullName.trim(),
          userId:   formData.userId.trim().toUpperCase(),
          email:    formData.email.trim().toLowerCase(),
          password: formData.password,
          role:     formData.role,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.message || 'Registration failed. Please try again.')
        return
      }

      // Persist JWT and user info to localStorage
      storeAuth(data)
      navigate('/dashboard')

    } catch (err) {
      console.error('[authController] Signup error:', err)
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return { formData, loading, error, handleChange, handleSignup }
}

// ── Logout Handler ────────────────────────────────────────────────────────────

/**
 * Creates a logout handler that:
 * 1. Calls POST /api/auth/logout (best-effort — doesn't block on failure)
 * 2. Clears all auth data from localStorage
 * 3. Navigates to the login page
 *
 * @param {Function} navigate - react-router navigate function
 * @returns {Function} onClick handler
 */
export function createLogoutHandler(navigate) {
  return async () => {
    // Best-effort server logout (fire & forget)
    try {
      const token = localStorage.getItem('cc_token')
      if (token) {
        await fetch('/api/auth/logout', {
          method:  'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    } catch {
      // Ignore network errors on logout — client-side clear is sufficient
    }

    clearAuth()
    navigate('/')
  }
}

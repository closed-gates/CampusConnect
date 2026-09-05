/**
 * apiClient.js – Centralized authenticated fetch wrapper.
 *
 * MVC Role: Service / Utility
 *
 * Every API call in CampusConnect should go through this client so that:
 *   1. The JWT Bearer token is automatically attached to every request.
 *   2. Target URLs are resolved against the deployed Render backend (VITE_API_BASE_URL).
 *   3. 401 responses clear auth and redirect to login automatically.
 *
 * Usage:
 *   import { apiClient } from './apiClient.js'
 *   const data = await apiClient.get('/api/courses/catalog')
 *   const result = await apiClient.post('/api/auth/login', { identifier, password })
 *   // For multipart (file upload):
 *   const result = await apiClient.upload('/api/assignments', formData)
 */

import { getStoredToken, clearAuth } from '../models/authModel.js'

/** Deployed backend base URL on Render (defaults to empty string if not configured) */
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

/** Redirect to login and clear auth data */
function handleUnauthorized() {
  clearAuth()
  window.location.href = '/'
}

/**
 * Core fetch wrapper — adds Authorization header and handles 401.
 *
 * @param {string} url  - Relative URL (e.g. '/api/courses/catalog') or absolute URL
 * @param {RequestInit} options - Standard fetch options
 * @returns {Promise<Response>}
 */
async function authFetch(url, options = {}) {
  const token = getStoredToken()

  const headers = {
    ...(options.headers || {}),
  }

  // Attach Bearer token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Only set Content-Type for JSON; let browser handle multipart
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }

  const targetUrl = url.startsWith('http://') || url.startsWith('https://')
    ? url
    : `${API_BASE}${url.startsWith('/') ? url : `/${url}`}`

  const response = await fetch(targetUrl, { ...options, headers })

  // If server says token is invalid/expired → logout and redirect
  if (response.status === 401) {
    handleUnauthorized()
  }

  return response
}

// ── Convenience methods ───────────────────────────────────────────────────────

const apiClient = {
  /**
   * GET request with auth header.
   * @param {string} url
   * @returns {Promise<Response>}
   */
  get: (url) => authFetch(url, { method: 'GET' }),

  /**
   * POST request with JSON body and auth header.
   * @param {string} url
   * @param {object} body
   * @returns {Promise<Response>}
   */
  post: (url, body) => authFetch(url, {
    method: 'POST',
    body:   JSON.stringify(body),
  }),

  /**
   * PUT request with JSON body and auth header.
   * @param {string} url
   * @param {object} body
   * @returns {Promise<Response>}
   */
  put: (url, body) => authFetch(url, {
    method: 'PUT',
    body:   JSON.stringify(body),
  }),

  /**
   * DELETE request with auth header.
   * @param {string} url
   * @returns {Promise<Response>}
   */
  delete: (url) => authFetch(url, { method: 'DELETE' }),

  /**
   * POST multipart/form-data (file uploads) with auth header.
   * Do NOT set Content-Type — browser must set the boundary automatically.
   * @param {string} url
   * @param {FormData} formData
   * @returns {Promise<Response>}
   */
  upload: (url, formData, method = 'POST') => authFetch(url, {
    method,
    body:    formData,
    headers: {},   // override to prevent Content-Type: application/json
  }),
}

export default apiClient

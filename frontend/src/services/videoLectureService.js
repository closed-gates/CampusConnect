/**
 * videoLectureService.js – HTTP client for /api/video-lectures.
 *
 * MVC Role: Service
 */

import apiClient from './apiClient.js'
import { getStoredToken } from '../models/authModel.js'

const API_BASE = '/api/video-lectures'

export async function getLectures() {
  const res = await apiClient.get(API_BASE)
  if (!res.ok) throw new Error(`Failed to load lectures: ${res.status}`)
  const json = await res.json()
  return json.data || []
}

export async function getLecture(id) {
  const res = await apiClient.get(`${API_BASE}/${id}`)
  if (!res.ok) throw new Error(`Failed to load lecture: ${res.status}`)
  const json = await res.json()
  return json.data
}

export async function createLecture(formData) {
  const res = await apiClient.upload(API_BASE, formData)
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || `Failed to create lecture: ${res.status}`)
  return json.data
}

export async function deleteLecture(id) {
  const res = await apiClient.delete(`${API_BASE}/${id}`)
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || `Failed to delete lecture: ${res.status}`)
  return true
}

/**
 * Direct URL for {@code <video src>}. The browser streams with Range requests
 * and sends the JWT as access_token because media elements cannot set Authorization.
 */
export function getAuthenticatedStreamUrl(id) {
  const origin = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
  const token = getStoredToken()
  const query = token ? `?access_token=${encodeURIComponent(token)}` : ''
  return `${origin}${API_BASE}/${id}/stream${query}`
}

export async function saveProgress(id, positionSeconds, durationSeconds) {
  const res = await apiClient.put(`${API_BASE}/${id}/progress`, {
    positionSeconds,
    durationSeconds,
  })
  if (!res.ok) return null
  const json = await res.json().catch(() => ({}))
  return json.data || null
}

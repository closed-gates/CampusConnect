/**
 * courseMaterialService.js – HTTP client for /api/course-materials.
 *
 * MVC Role: Service
 */

import apiClient from './apiClient.js'

const API_BASE = '/api/course-materials'

export async function getMaterials() {
  const res = await apiClient.get(API_BASE)
  if (!res.ok) throw new Error(`Failed to load materials: ${res.status}`)
  const json = await res.json()
  return json.data || []
}

export async function createMaterial(formData) {
  const res = await apiClient.upload(API_BASE, formData)
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || `Failed to upload material: ${res.status}`)
  return json.data
}

export async function deleteMaterial(id) {
  const res = await apiClient.delete(`${API_BASE}/${id}`)
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json.message || `Failed to delete material: ${res.status}`)
  return true
}

export async function fetchMaterialFile(id, disposition = 'download') {
  const res = await apiClient.get(`${API_BASE}/${id}/${disposition === 'view' ? 'view' : 'download'}`)
  const contentType = res.headers.get('content-type') || ''
  if (!res.ok || contentType.includes('json') || contentType.includes('text/html')) {
    throw new Error(disposition === 'view' ? 'Could not open the file.' : 'Could not download the file.')
  }
  const buffer = await res.arrayBuffer()
  return { buffer, contentType, filename: null }
}

export async function downloadMaterial(id, filename) {
  const file = await fetchMaterialFile(id, 'download')
  return { blob: new Blob([file.buffer], { type: file.contentType || 'application/octet-stream' }), filename: filename || 'material' }
}

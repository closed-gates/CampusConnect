/**
 * courseMaterialModel.js – constants and helpers for course materials.
 *
 * MVC Role: Model
 */

export const KIND_NOTES = 'NOTES'
export const KIND_SLIDES = 'SLIDES'
export const KIND_DOC = 'DOCUMENT'

export const KIND_OPTIONS = [
  { value: KIND_NOTES, label: 'Lecture notes' },
  { value: KIND_SLIDES, label: 'Slides' },
  { value: KIND_DOC, label: 'Document' },
]

export const KIND_LABELS = {
  NOTES: 'Lecture notes',
  SLIDES: 'Slides',
  DOCUMENT: 'Document',
}

export const MAX_MATERIAL_BYTES = 25 * 1024 * 1024

export const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx',
  'txt', 'csv', 'zip', 'png', 'jpg', 'jpeg', 'gif', 'webp',
]

export const EMPTY_MATERIAL_FORM = {
  title: '',
  description: '',
  courseCode: '',
  courseName: '',
  kind: KIND_SLIDES,
}

export function toCourseOptions(catalog) {
  const rows = Array.isArray(catalog) ? catalog : []
  const seen = new Set()
  return rows
    .filter(course => {
      const code = course?.code
      if (!code || seen.has(code)) return false
      seen.add(code)
      return true
    })
    .map(course => ({ code: course.code, name: course.name || course.title || course.code }))
    .sort((a, b) => a.code.localeCompare(b.code))
}

export function courseNameForCode(code, options = []) {
  const match = options.find(option => option.code === code)
  return match ? match.name : ''
}

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function isAllowedMaterialFile(file) {
  if (!file) return false
  if (file.size > MAX_MATERIAL_BYTES) return false
  const name = file.name || ''
  const dot = name.lastIndexOf('.')
  if (dot < 0) return false
  const ext = name.slice(dot + 1).toLowerCase()
  return ALLOWED_EXTENSIONS.includes(ext)
}

export function fileIcon(filename) {
  const ext = (filename || '').split('.').pop()?.toLowerCase()
  if (ext === 'pdf') return '📄'
  if (ext === 'ppt' || ext === 'pptx') return '📽️'
  if (ext === 'doc' || ext === 'docx') return '📝'
  if (ext === 'xls' || ext === 'xlsx' || ext === 'csv') return '📊'
  if (ext === 'zip') return '🗜️'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return '🖼️'
  return '📎'
}

export function previewMode(filename, contentType) {
  const ext = (filename || '').split('.').pop()?.toLowerCase() || ''
  const type = (contentType || '').toLowerCase()
  if (ext === 'pdf' || type.includes('pdf')) return 'pdf'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext) || type.startsWith('image/')) return 'image'
  if (ext === 'txt' || ext === 'csv' || type.startsWith('text/')) return 'text'
  return 'document'
}

export function blobTypeForPreview(filename, contentType) {
  const mode = previewMode(filename, contentType)
  if (mode === 'pdf') return 'application/pdf'
  if (mode === 'image') {
    const ext = (filename || '').split('.').pop()?.toLowerCase()
    if (ext === 'png') return 'image/png'
    if (ext === 'gif') return 'image/gif'
    if (ext === 'webp') return 'image/webp'
    if (contentType && contentType.startsWith('image/')) return contentType
    return 'image/jpeg'
  }
  if (mode === 'text') return contentType && contentType.startsWith('text/') ? contentType : 'text/plain'
  return contentType || 'application/octet-stream'
}

export function formatUploadedAt(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString()
}

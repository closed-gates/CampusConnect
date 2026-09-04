/**
 * videoLectureModel.js – constants and pure helpers for video lectures.
 *
 * MVC Role: Model
 * No React, hooks, JSX, or styles.
 */

export const SOURCE_UPLOAD = 'UPLOAD'
export const SOURCE_EMBED = 'EMBED'

export const MAX_VIDEO_BYTES = 200 * 1024 * 1024

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-matroska',
]

export const COURSE_OPTIONS = [
  { code: 'CSE110', name: 'Programming Language I' },
  { code: 'CSE220', name: 'Data Structures' },
  { code: 'CSE321', name: 'Operating Systems' },
  { code: 'CSE370', name: 'Database Systems' },
  { code: 'CSE421', name: 'Computer Networks' },
  { code: 'CSE470', name: 'Software Engineering' },
  { code: 'CSE481', name: 'Machine Learning' },
]

export const EMPTY_LECTURE_FORM = {
  title: '',
  description: '',
  courseCode: 'CSE470',
  courseName: 'Software Engineering',
  sourceType: SOURCE_EMBED,
  embedUrl: '',
}

export function courseNameForCode(code) {
  const match = COURSE_OPTIONS.find(option => option.code === code)
  return match ? match.name : ''
}

export function formatFileSize(bytes) {
  if (!bytes && bytes !== 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatClock(seconds) {
  const total = Math.max(0, Math.floor(Number(seconds) || 0))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}

export function isAllowedVideoFile(file) {
  if (!file) return false
  if (file.size > MAX_VIDEO_BYTES) return false
  if (ALLOWED_VIDEO_TYPES.includes(file.type)) return true
  return /\.(mp4|webm|ogg|mov|mkv)$/i.test(file.name || '')
}

export function isYouTubeUrl(url) {
  if (!url) return false
  return url.includes('youtu.be') || url.includes('youtube.com')
}

export function extractYouTubeId(url) {
  if (!isYouTubeUrl(url)) return null
  const short = url.match(/youtu\.be\/([^?&/]+)/)
  if (short) return short[1]
  const embed = url.match(/youtube\.com\/embed\/([^?&/]+)/)
  if (embed) return embed[1]
  const shorts = url.match(/youtube\.com\/shorts\/([^?&/]+)/)
  if (shorts) return shorts[1]
  const watch = url.match(/[?&]v=([^?&/]+)/)
  if (watch) return watch[1]
  return null
}

export function progressLabel(lecture) {
  if (!lecture) return 'Not started'
  if (lecture.completed || lecture.percentWatched >= 95) return 'Completed'
  if ((lecture.percentWatched || 0) > 0) return `${lecture.percentWatched}% watched`
  return 'Not started'
}

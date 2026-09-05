/**
 * videoLectureController.js – state and handlers for video lectures.
 *
 * MVC Role: Controller
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { getStoredRole, getStoredUser } from '../models/authModel.js'
import {
  COURSE_OPTIONS,
  EMPTY_LECTURE_FORM,
  SOURCE_EMBED,
  SOURCE_UPLOAD,
  courseNameForCode,
  extractYouTubeId,
  isAllowedVideoFile,
  isYouTubeUrl,
} from '../models/videoLectureModel.js'
import * as videoLectureService from '../services/videoLectureService.js'

export function useVideoLectureController() {
  const role = (getStoredRole() || 'STUDENT').toUpperCase()
  const user = getStoredUser()
  const canManage = role === 'FACULTY' || role === 'ADMIN'

  const [lectures, setLectures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [streamUrl, setStreamUrl] = useState('')
  const [streamLoading, setStreamLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({ ...EMPTY_LECTURE_FORM })
  const [createFile, setCreateFile] = useState(null)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [toast, setToast] = useState(null)

  const videoRef = useRef(null)
  const lastSaveRef = useRef(0)
  const streamUrlRef = useRef('')
  const ytPlayerRef = useRef(null)
  const ytTimerRef = useRef(null)
  const selectedRef = useRef(null)
  const resumeDoneRef = useRef(false)

  selectedRef.current = selected

  function showToast(message, type = 'success') {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 4000)
  }

  const loadLectures = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await videoLectureService.getLectures()
      setLectures(data)
    } catch (err) {
      setError(err.message || 'Could not load video lectures.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadLectures()
  }, [loadLectures])

  useEffect(() => {
    streamUrlRef.current = streamUrl
  }, [streamUrl])

  useEffect(() => {
    return () => {
      if (ytTimerRef.current) window.clearInterval(ytTimerRef.current)
      if (ytPlayerRef.current?.destroy) ytPlayerRef.current.destroy()
    }
  }, [])

  const persistProgress = useCallback(async (lectureId, positionSeconds, durationSeconds, force = false) => {
    const now = Date.now()
    if (!force && now - lastSaveRef.current < 5000) return
    lastSaveRef.current = now
    const saved = await videoLectureService.saveProgress(lectureId, positionSeconds, durationSeconds)
    if (!saved) return
    setSelected(prev => (prev && prev.id === lectureId ? { ...prev, ...saved } : prev))
    setLectures(prev => prev.map(item => (item.id === lectureId ? { ...item, ...saved } : item)))
  }, [])

  const openLecture = useCallback(async (lecture) => {
    if (streamUrlRef.current) {
      if (streamUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(streamUrlRef.current)
      }
      streamUrlRef.current = ''
      setStreamUrl('')
    }
    lastSaveRef.current = 0
    resumeDoneRef.current = false
    setSelected(lecture)
    if (lecture.sourceType !== SOURCE_UPLOAD) return
    setStreamLoading(true)
    try {
      const url = videoLectureService.getAuthenticatedStreamUrl(lecture.id)
      streamUrlRef.current = url
      setStreamUrl(url)
    } catch (err) {
      showToast(err.message || 'Could not load the video file.', 'error')
    } finally {
      setStreamLoading(false)
    }
  }, [])

  const closeLecture = useCallback(() => {
    const video = videoRef.current
    if (selected && video && selected.sourceType === SOURCE_UPLOAD) {
      persistProgress(selected.id, video.currentTime, video.duration, true)
    }
    if (streamUrlRef.current) {
      if (streamUrlRef.current.startsWith('blob:')) {
        URL.revokeObjectURL(streamUrlRef.current)
      }
      streamUrlRef.current = ''
    }
    setStreamUrl('')
    setSelected(null)
  }, [persistProgress, selected])

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current
    const lecture = selectedRef.current
    if (!video || !lecture || video.paused) return
    persistProgress(lecture.id, video.currentTime, video.duration, false)
  }, [persistProgress])

  const handlePauseOrEnded = useCallback(() => {
    const video = videoRef.current
    const lecture = selectedRef.current
    if (!video || !lecture) return
    persistProgress(lecture.id, video.currentTime, video.duration, true)
  }, [persistProgress])

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current
    const lecture = selectedRef.current
    if (!video || !lecture || resumeDoneRef.current) return
    const resumeAt = Number(lecture.positionSeconds) || 0
    if (resumeAt > 1 && !lecture.completed) {
      video.currentTime = resumeAt
    }
    resumeDoneRef.current = true
  }, [])

  const lectureId = selected?.id ?? null
  const lectureSource = selected?.sourceType ?? null
  const lectureEmbedUrl = selected?.embedUrl ?? null

  useEffect(() => {
    if (!lectureId || lectureSource !== SOURCE_EMBED || !isYouTubeUrl(lectureEmbedUrl)) {
      if (ytTimerRef.current) window.clearInterval(ytTimerRef.current)
      if (ytPlayerRef.current?.destroy) {
        ytPlayerRef.current.destroy()
        ytPlayerRef.current = null
      }
      return undefined
    }

    const videoId = extractYouTubeId(lectureEmbedUrl)
    if (!videoId) return undefined

    let cancelled = false

    function attachPlayer() {
      if (cancelled || !window.YT || !window.YT.Player) return
      const mount = document.getElementById('vl-yt-player')
      if (!mount) return
      if (ytPlayerRef.current?.destroy) ytPlayerRef.current.destroy()
      ytPlayerRef.current = new window.YT.Player(mount, {
        videoId,
        width: '100%',
        height: '100%',
        playerVars: { rel: 0, modestbranding: 1 },
        events: {
          onReady: (event) => {
            const lecture = selectedRef.current
            const resumeAt = Number(lecture?.positionSeconds) || 0
            if (resumeAt > 1 && !lecture?.completed && event.target.seekTo) {
              event.target.seekTo(resumeAt, true)
            }
            if (ytTimerRef.current) window.clearInterval(ytTimerRef.current)
            ytTimerRef.current = window.setInterval(() => {
              const player = ytPlayerRef.current
              const current = selectedRef.current
              if (!player || !current || typeof player.getCurrentTime !== 'function') return
              persistProgress(current.id, player.getCurrentTime(), player.getDuration(), false)
            }, 5000)
          },
          onStateChange: (event) => {
            const player = event.target
            const current = selectedRef.current
            if (!current) return
            if (event.data === 0 || event.data === 2) {
              persistProgress(current.id, player.getCurrentTime(), player.getDuration(), true)
            }
          },
        },
      })
    }

    if (window.YT && window.YT.Player) {
      attachPlayer()
    } else {
      const existing = document.getElementById('vl-youtube-iframe-api')
      window.onYouTubeIframeAPIReady = attachPlayer
      if (!existing) {
        const tag = document.createElement('script')
        tag.id = 'vl-youtube-iframe-api'
        tag.src = 'https://www.youtube.com/iframe_api'
        document.body.appendChild(tag)
      }
    }

    return () => {
      cancelled = true
      if (ytTimerRef.current) window.clearInterval(ytTimerRef.current)
      if (ytPlayerRef.current?.destroy) {
        ytPlayerRef.current.destroy()
        ytPlayerRef.current = null
      }
    }
  }, [lectureEmbedUrl, lectureId, lectureSource, persistProgress])

  function handleFormChange(event) {
    const { name, value } = event.target
    setCreateForm(prev => {
      const next = { ...prev, [name]: value }
      if (name === 'courseCode') next.courseName = courseNameForCode(value)
      return next
    })
  }

  function handleFileSelect(event) {
    const file = event.target.files?.[0]
    if (!file) {
      setCreateFile(null)
      return
    }
    if (!isAllowedVideoFile(file)) {
      showToast('Choose an MP4, WebM, OGG, MOV, or MKV file up to 200 MB.', 'error')
      event.target.value = ''
      setCreateFile(null)
      return
    }
    setCreateFile(file)
  }

  async function handleCreate(event) {
    event.preventDefault()
    if (!canManage) return
    if (!createForm.title.trim()) {
      showToast('Title is required.', 'error')
      return
    }
    if (createForm.sourceType === SOURCE_EMBED && !createForm.embedUrl.trim()) {
      showToast('Paste a YouTube, Vimeo, or other HTTPS video URL.', 'error')
      return
    }
    if (createForm.sourceType === SOURCE_UPLOAD && !createFile) {
      showToast('Choose a video file to upload.', 'error')
      return
    }

    setCreating(true)
    try {
      const formData = new FormData()
      formData.append('title', createForm.title.trim())
      formData.append('description', createForm.description.trim())
      formData.append('courseCode', createForm.courseCode)
      formData.append('courseName', createForm.courseName)
      formData.append('sourceType', createForm.sourceType)
      if (createForm.sourceType === SOURCE_EMBED) {
        formData.append('embedUrl', createForm.embedUrl.trim())
      }
      if (createForm.sourceType === SOURCE_UPLOAD && createFile) {
        formData.append('file', createFile)
      }
      const created = await videoLectureService.createLecture(formData)
      setLectures(prev => [created, ...prev])
      setShowCreateForm(false)
      setCreateForm({ ...EMPTY_LECTURE_FORM })
      setCreateFile(null)
      showToast('Lecture published.')
    } catch (err) {
      showToast(err.message || 'Could not publish the lecture.', 'error')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id) {
    if (!canManage) return
    setDeletingId(id)
    try {
      await videoLectureService.deleteLecture(id)
      setLectures(prev => prev.filter(item => item.id !== id))
      if (selected?.id === id) closeLecture()
      showToast('Lecture deleted.')
    } catch (err) {
      showToast(err.message || 'Could not delete the lecture.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleMarkComplete() {
    if (!selected) return
    const duration = Number(selected.durationSeconds) || 1
    await persistProgress(selected.id, duration, duration, true)
    showToast('Marked as watched.')
  }

  return {
    role,
    user,
    canManage,
    lectures,
    loading,
    error,
    selected,
    streamUrl,
    streamLoading,
    showCreateForm,
    setShowCreateForm,
    createForm,
    createFile,
    creating,
    deletingId,
    toast,
    videoRef,
    courseOptions: COURSE_OPTIONS,
    sourceUpload: SOURCE_UPLOAD,
    sourceEmbed: SOURCE_EMBED,
    isYouTubeEmbed: selected ? isYouTubeUrl(selected.embedUrl) : false,
    loadLectures,
    openLecture,
    closeLecture,
    handleTimeUpdate,
    handlePauseOrEnded,
    handleLoadedMetadata,
    handleFormChange,
    handleFileSelect,
    handleCreate,
    handleDelete,
    handleMarkComplete,
  }
}

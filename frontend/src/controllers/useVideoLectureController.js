/**
 * useVideoLectureController.js – Controller layer for the Video Lecture feature.
 *
 * MVC Role: Controller
 * Custom React hook managing state, video player actions, progress tracking, and API fetch logic.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  INITIAL_UPLOAD_FORM,
  DEFAULT_LECTURES,
  filterLecturesForStudent,
} from '../models/videoLectureModel.js'

export function useVideoLectureController() {
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'student')
  const [lectures, setLectures] = useState([])
  const [enrolledCourses, setEnrolledCourses] = useState(['CSE470', 'CSE110'])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Filters & Modal State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all')
  const [activeVideo, setActiveVideo] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadForm, setUploadForm] = useState(INITIAL_UPLOAD_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // Fetch enrolled courses for student from Registration API
  const fetchEnrolledCourses = useCallback(async () => {
    try {
      const res = await fetch('/api/registration/my?studentId=STU001')
      if (res.ok) {
        const regs = await res.json()
        const codes = regs
          .map(r => r.sectionId ? r.sectionId.split('-')[0] : r.courseCode)
          .filter(Boolean)
        if (codes.length > 0) {
          setEnrolledCourses(Array.from(new Set(codes)))
        }
      }
    } catch {
      // Keep default enrolled courses ['CSE470', 'CSE110'] if server offline
    }
  }, [])

  // Fetch video lectures from backend API
  const fetchLectures = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const url = `/api/lectures?studentId=STU001&userRole=${userRole}&courseCode=${selectedCourseFilter}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to load lectures')
      const data = await res.json()
      setLectures(data)
    } catch {
      // Fallback to static seed model data if backend endpoint unreachable
      let fallback = DEFAULT_LECTURES
      if (userRole === 'student') {
        fallback = filterLecturesForStudent(DEFAULT_LECTURES, enrolledCourses)
      }
      if (selectedCourseFilter !== 'all') {
        fallback = fallback.filter(l => l.courseCode.toUpperCase() === selectedCourseFilter.toUpperCase())
      }
      setLectures(fallback)
    } finally {
      setLoading(false)
    }
  }, [userRole, selectedCourseFilter, enrolledCourses])

  useEffect(() => {
    fetchEnrolledCourses()
  }, [fetchEnrolledCourses])

  useEffect(() => {
    fetchLectures()
  }, [fetchLectures])

  // Filter lectures based on search query
  const filteredLectures = lectures.filter(lec => {
    const matchesSearch =
      lec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lec.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lec.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Watch Progress Auto-save Handler
  const handleProgressUpdate = useCallback(async (videoId, currentTime, totalDuration) => {
    if (!videoId || !totalDuration || totalDuration <= 0) return

    const pct = Math.min(100, Math.round((currentTime / totalDuration) * 1000) / 10)
    const isCompleted = pct >= 90.0

    // Update local state instantly
    setLectures(prev =>
      prev.map(lec => {
        if (lec.id === videoId) {
          return {
            ...lec,
            lastPositionSeconds: Math.floor(currentTime),
            percentage: pct,
            completed: isCompleted || lec.completed,
          }
        }
        return lec
      })
    )

    // Sync with backend API
    try {
      await fetch(`/api/lectures/${videoId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: 'STU001',
          videoLectureId: videoId,
          lastPositionSeconds: Math.floor(currentTime),
          totalDurationSeconds: Math.floor(totalDuration),
        }),
      })
    } catch (e) {
      console.warn('Progress sync warning:', e)
    }
  }, [])

  // Open Video Player Modal
  const handleSelectVideo = (video) => {
    setActiveVideo(video)
  }

  // Close Video Player Modal
  const handleClosePlayer = () => {
    setActiveVideo(null)
  }

  // Handle Form Change for Upload Modal
  const handleUploadFormChange = (e) => {
    const { name, value } = e.target
    setUploadForm(prev => ({ ...prev, [name]: value }))
  }

  // Submit Upload Form (Teacher / Faculty / Admin)
  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!uploadForm.title || !uploadForm.videoUrl || !uploadForm.courseCode) {
      setToastMessage('Please fill in all required fields.')
      return
    }

    setIsSubmitting(true)
    const payload = {
      title: uploadForm.title,
      courseCode: uploadForm.courseCode.toUpperCase(),
      description: uploadForm.description,
      videoUrl: uploadForm.videoUrl,
      teacherName: uploadForm.teacherName || 'Faculty Instructor',
      durationSeconds: parseInt(uploadForm.durationSeconds, 10) || 600,
    }

    try {
      const res = await fetch('/api/lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Upload failed')
      const created = await res.json()
      setLectures(prev => [created, ...prev])
      setToastMessage('Video lecture uploaded successfully!')
    } catch {
      // Local state fallback
      const newLec = {
        ...payload,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        lastPositionSeconds: 0,
        percentage: 0,
        completed: false,
      }
      setLectures(prev => [newLec, ...prev])
      setToastMessage('Video lecture added to feed!')
    } finally {
      setIsSubmitting(false)
      setShowUploadModal(false)
      setUploadForm(INITIAL_UPLOAD_FORM)
      setTimeout(() => setToastMessage(null), 4000)
    }
  }

  // Delete Video Lecture (Teacher / Admin)
  const handleDeleteLecture = async (lectureId) => {
    if (!window.confirm('Are you sure you want to delete this video lecture?')) return
    try {
      await fetch(`/api/lectures/${lectureId}`, { method: 'DELETE' })
    } catch (e) {
      console.warn('Delete backend error:', e)
    }
    setLectures(prev => prev.filter(l => l.id !== lectureId))
    if (activeVideo && activeVideo.id === lectureId) {
      setActiveVideo(null)
    }
    setToastMessage('Lecture deleted.')
    setTimeout(() => setToastMessage(null), 3000)
  }

  return {
    userRole,
    lectures: filteredLectures,
    enrolledCourses,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedCourseFilter,
    setSelectedCourseFilter,
    activeVideo,
    handleSelectVideo,
    handleClosePlayer,
    handleProgressUpdate,
    showUploadModal,
    setShowUploadModal,
    uploadForm,
    handleUploadFormChange,
    handleUploadSubmit,
    isSubmitting,
    handleDeleteLecture,
    toastMessage,
  }
}

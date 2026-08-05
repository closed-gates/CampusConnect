/**
 * clubController.js – Controller layer for the Club Activities page.
 *
 * MVC Role: Controller
 * Manages all state and handlers for notices, recruitment, and applications.
 * Used by ClubActivitiesView.
 */

import { useState, useEffect } from 'react'
import {
  SEED_NOTICES,
  SEED_RECRUITMENTS,
  RECRUITMENT_FORM_STEPS,
  EMPTY_RECRUITMENT_FORM,
} from '../models/clubModel.js'

/**
 * useClubController
 * Manages tabs, notices, recruitments, multi-step application form, and toast state.
 *
 * TODO (Phase 2): Wire API calls:
 *   GET  /api/clubs/notices       → initial notices
 *   GET  /api/clubs/recruitment   → initial recruitments
 *   POST /api/clubs/notices       → handlePostNotice
 *   POST /api/clubs/recruitment   → handlePostRecruitment
 *   POST /api/clubs/apply         → handleApply
 */
export function useClubController() {
  const role    = localStorage.getItem('userRole') || 'student'
  const isAdmin = role === 'admin'

  const [activeTab,  setActiveTab]  = useState('notices')

  // Data state
  const [notices,      setNotices]      = useState(SEED_NOTICES)
  const [recruitments, setRecruitments] = useState(SEED_RECRUITMENTS)
  const [toast,        setToast]        = useState(null)

  // Notices UI state
  const [expandedNotice,   setExpandedNotice]   = useState(null)
  const [noticeForm,       setNoticeForm]       = useState({ clubName: '', title: '', body: '' })
  const [noticeSubmitting, setNoticeSubmitting] = useState(false)

  // Recruitment UI state
  const [recruitForm,       setRecruitForm]       = useState({ clubName: '', role: '', description: '', deadline: '', slots: '' })
  const [recruitSubmitting, setRecruitSubmitting] = useState(false)

  // ── Multi-step Application Form State ────────────────────────
  const [applyTarget,      setApplyTarget]      = useState(null) // recruitment object or null
  const [applyStep,        setApplyStep]        = useState(0)    // current step index
  const [applyForm,        setApplyForm]        = useState({ ...EMPTY_RECRUITMENT_FORM })
  const [applySubmitting,  setApplySubmitting]  = useState(false)
  const [applyErrors,      setApplyErrors]      = useState({})

  const totalSteps = RECRUITMENT_FORM_STEPS.length

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(t)
    }
  }, [toast])

  /* ── Helper ───────────────────────────────────────────────── */
  function showToast(message, type = 'success') {
    setToast({ message, type })
  }

  /* ── Handlers ─────────────────────────────────────────────── */

  // Admin: post notice
  async function handlePostNotice(e) {
    e.preventDefault()
    if (!noticeForm.clubName || !noticeForm.title || !noticeForm.body) return
    setNoticeSubmitting(true)
    await new Promise(r => setTimeout(r, 600))
    const newNotice = {
      id: Date.now(),
      ...noticeForm,
      postedBy: 'Admin',
      postedAt: new Date().toISOString(),
      pinned: false,
    }
    setNotices(prev => [newNotice, ...prev])
    setNoticeForm({ clubName: '', title: '', body: '' })
    setNoticeSubmitting(false)
    showToast('✅ Notice posted successfully!')
  }

  // Admin: post recruitment
  async function handlePostRecruitment(e) {
    e.preventDefault()
    if (!recruitForm.clubName || !recruitForm.role || !recruitForm.description || !recruitForm.deadline) return
    setRecruitSubmitting(true)
    await new Promise(r => setTimeout(r, 600))
    const newRec = {
      id: Date.now(),
      ...recruitForm,
      slots: parseInt(recruitForm.slots) || 5,
    }
    setRecruitments(prev => [newRec, ...prev])
    setRecruitForm({ clubName: '', role: '', description: '', deadline: '', slots: '' })
    setRecruitSubmitting(false)
    showToast('✅ Recruitment posting published!')
  }

  /* ── Multi-step Application Form Logic ────────────────────── */

  // Open the multi-step form for a recruitment
  function openApplyModal(rec) {
    setApplyTarget(rec)
    setApplyStep(0)
    setApplyForm({ ...EMPTY_RECRUITMENT_FORM })
    setApplyErrors({})
  }

  function closeApplyModal() {
    setApplyTarget(null)
    setApplyStep(0)
    setApplyForm({ ...EMPTY_RECRUITMENT_FORM })
    setApplyErrors({})
  }

  // Validate fields for the current step
  function validateStep(step) {
    const errors = {}
    const stepId = RECRUITMENT_FORM_STEPS[step]?.id

    if (stepId === 'personal') {
      if (!applyForm.fullName.trim()) errors.fullName = 'Full name is required'
      if (!applyForm.studentId.trim()) errors.studentId = 'Student ID is required'
      if (!applyForm.universityEmail.trim()) errors.universityEmail = 'University email is required'
      else if (!/\S+@\S+\.\S+/.test(applyForm.universityEmail)) errors.universityEmail = 'Enter a valid email'
      if (!applyForm.department) errors.department = 'Department is required'
      if (!applyForm.yearSemester) errors.yearSemester = 'Year/Semester is required'
    }

    if (stepId === 'interests') {
      if (applyForm.interestedTeams.length === 0) errors.interestedTeams = 'Select at least one team'
      if (!applyForm.motivation.trim()) errors.motivation = 'Please tell us why you want to join'
    }

    if (stepId === 'availability') {
      if (!applyForm.willingToParticipate) errors.willingToParticipate = 'Please select an option'
    }

    return errors
  }

  function nextStep() {
    const errors = validateStep(applyStep)
    if (Object.keys(errors).length > 0) {
      setApplyErrors(errors)
      return
    }
    setApplyErrors({})
    if (applyStep < totalSteps - 1) {
      setApplyStep(prev => prev + 1)
    }
  }

  function prevStep() {
    setApplyErrors({})
    if (applyStep > 0) {
      setApplyStep(prev => prev - 1)
    }
  }

  // Submit application (called from the final question step)
  async function handleApply() {
    const errors = validateStep(applyStep)
    if (Object.keys(errors).length > 0) {
      setApplyErrors(errors)
      return
    }
    setApplySubmitting(true)
    await new Promise(r => setTimeout(r, 800))
    setApplySubmitting(false)
    // Move to confirmation step
    setApplyStep(totalSteps - 1)
    showToast('🎉 Application submitted! The club will contact you soon.')
  }

  // Update a field in the apply form
  function updateApplyField(field, value) {
    setApplyForm(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (applyErrors[field]) {
      setApplyErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  // Toggle a value in an array field (for checkboxes)
  function toggleApplyArrayField(field, value) {
    setApplyForm(prev => {
      const arr = prev[field]
      const next = arr.includes(value)
        ? arr.filter(v => v !== value)
        : [...arr, value]
      return { ...prev, [field]: next }
    })
    if (applyErrors[field]) {
      setApplyErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const sortedNotices = [...notices].sort((a, b) => Number(b.pinned) - Number(a.pinned))

  return {
    // Role
    isAdmin,
    // Tab
    activeTab, setActiveTab,
    // Data
    notices: sortedNotices,
    recruitments,
    toast,
    // Notice state
    expandedNotice, setExpandedNotice,
    noticeForm, setNoticeForm,
    noticeSubmitting,
    handlePostNotice,
    // Recruitment state
    recruitForm, setRecruitForm,
    recruitSubmitting,
    handlePostRecruitment,
    // Multi-step Application state
    applyTarget,
    applyStep,
    applyForm,
    applyErrors,
    applySubmitting,
    totalSteps,
    openApplyModal,
    closeApplyModal,
    nextStep,
    prevStep,
    handleApply,
    updateApplyField,
    toggleApplyArrayField,
  }
}

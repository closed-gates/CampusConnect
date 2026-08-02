/**
 * clubController.js – Controller layer for the Club Activities page.
 *
 * MVC Role: Controller
 * Manages all state and handlers for notices, recruitment, and applications.
 * Used by ClubActivitiesView.
 */

import { useState, useEffect } from 'react'
import { SEED_NOTICES, SEED_RECRUITMENTS } from '../models/clubModel.js'

/**
 * useClubController
 * Manages tabs, notices, recruitments, application modal, and toast state.
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

  // Application modal state
  const [applyTarget,      setApplyTarget]      = useState(null)
  const [applyForm,        setApplyForm]        = useState({ studentName: '', studentEmail: '', motivation: '' })
  const [applySubmitting,  setApplySubmitting]  = useState(false)

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

  // Student: open apply modal
  function openApplyModal(rec) {
    setApplyTarget(rec)
    setApplyForm({ studentName: '', studentEmail: '', motivation: '' })
  }

  // Student: submit application
  async function handleApply(e) {
    e.preventDefault()
    if (!applyForm.studentName || !applyForm.studentEmail || !applyForm.motivation) return
    setApplySubmitting(true)
    await new Promise(r => setTimeout(r, 700))
    setApplySubmitting(false)
    setApplyTarget(null)
    setApplyForm({ studentName: '', studentEmail: '', motivation: '' })
    showToast('🎉 Application submitted! The club will contact you soon.')
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
    // Application state
    applyTarget,
    applyForm, setApplyForm,
    applySubmitting,
    openApplyModal,
    closeApplyModal: () => setApplyTarget(null),
    handleApply,
  }
}

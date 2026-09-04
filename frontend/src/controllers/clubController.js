/**
 * clubController.js – Controller layer for the Club Activities page.
 *
 * MVC Role: Controller
 * Manages all state and handlers for notices, recruitment, and applications.
 * Used by ClubActivitiesView.
 *
 * Phase 3: All data is fetched from the real backend API (Neon PostgreSQL).
 *   GET  /api/clubs/notices       → initial notices
 *   GET  /api/clubs/recruitment   → initial recruitments
 *   POST /api/clubs/notices       → handlePostNotice
 *   POST /api/clubs/recruitment   → handlePostRecruitment
 *   POST /api/clubs/apply         → handleApply
 */

import { useState, useEffect } from 'react'
import {
  RECRUITMENT_FORM_STEPS,
  EMPTY_RECRUITMENT_FORM,
} from '../models/clubModel.js'
import apiClient from '../services/apiClient.js'
import { getStoredUser } from '../models/authModel.js'

const API_BASE = '/api'

/**
 * useClubController
 * Manages tabs, notices, recruitments, multi-step application form, and toast state.
 */
export function useClubController() {
  const currentUser = getStoredUser()
  const role = currentUser?.role || 'STUDENT'
  const isAdmin = role === 'ADMIN'

  const [activeTab,  setActiveTab]  = useState('notices')

  // Data state — starts empty, populated from API
  const [notices,      setNotices]      = useState([])
  const [recruitments, setRecruitments] = useState([])
  const [toast,        setToast]        = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [assignedClubs, setAssignedClubs] = useState([])
  const [clubs, setClubs] = useState([])
  const [isPanelMember, setIsPanelMember] = useState(false)
  const [panelMembers, setPanelMembers] = useState([])
  const [assignmentForm, setAssignmentForm] = useState({ studentId: '', clubName: '' })
  const [applications, setApplications] = useState([])

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

  // ── Load initial data from backend API ──────────────────────
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [noticesRes, recruitmentsRes, accessRes, clubsRes] = await Promise.all([
          apiClient.get(`${API_BASE}/clubs/notices`),
          apiClient.get(`${API_BASE}/clubs/recruitment`),
          apiClient.get(`${API_BASE}/clubs/access`),
          apiClient.get(`${API_BASE}/clubs`),
        ])

        if (noticesRes.ok) {
          const json = await noticesRes.json()
          setNotices(json.data || [])
        }
        if (accessRes.ok) {
          const access = await accessRes.json()
          setAssignedClubs(access.assignedClubs || [])
          setIsPanelMember(access.isPanelMember === true)
        }
        if (clubsRes.ok) setClubs(await clubsRes.json())
        if (isAdmin) {
          const membersRes = await apiClient.get(`${API_BASE}/clubs/panel-members`)
          if (membersRes.ok) setPanelMembers(await membersRes.json())
        }

        if (recruitmentsRes.ok) {
          const json = await recruitmentsRes.json()
          setRecruitments(json.data || [])
        }
      } catch (err) {
        console.error('[ClubController] Failed to load club data:', err)
        showToast('⚠️ Failed to load club data. Please try again.', 'error')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

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

  // Admin: post notice (calls backend API, then refreshes from server)
  async function handlePostNotice(e) {
    e.preventDefault()
    if (!noticeForm.clubName || !noticeForm.title || !noticeForm.body) return
    setNoticeSubmitting(true)

    try {
      const res = await apiClient.post(`${API_BASE}/clubs/notices`, noticeForm)
      if (res.ok) {
        const json = await res.json()
        // Prepend new notice to the list
        setNotices(prev => [json.data, ...prev])
        setNoticeForm({ clubName: '', title: '', body: '' })
        showToast('✅ Notice posted successfully!')
      } else {
        showToast('❌ Failed to post notice.', 'error')
      }
    } catch (err) {
      console.error('[ClubController] handlePostNotice error:', err)
      showToast('❌ Network error. Please try again.', 'error')
    } finally {
      setNoticeSubmitting(false)
    }
  }

  // Admin: post recruitment (calls backend API)
  async function handlePostRecruitment(e) {
    e.preventDefault()
    if (!recruitForm.clubName || !recruitForm.role || !recruitForm.description || !recruitForm.deadline) return
    setRecruitSubmitting(true)

    try {
      const res = await apiClient.post(`${API_BASE}/clubs/recruitment`, {
        ...recruitForm,
        slots: String(recruitForm.slots || 5),
      })
      if (res.ok) {
        const json = await res.json()
        setRecruitments(prev => [json.data, ...prev])
        setRecruitForm({ clubName: '', role: '', description: '', deadline: '', slots: '' })
        showToast('✅ Recruitment posting published!')
      } else {
        showToast('❌ Failed to post recruitment.', 'error')
      }
    } catch (err) {
      console.error('[ClubController] handlePostRecruitment error:', err)
      showToast('❌ Network error. Please try again.', 'error')
    } finally {
      setRecruitSubmitting(false)
    }
  }

  async function assignPanelMember(e) {
    e.preventDefault()
    const res = await apiClient.post(`${API_BASE}/clubs/panel-members`, assignmentForm)
    if (res.ok) { const item=await res.json(); setPanelMembers(p=>[...p,item]); setAssignmentForm({studentId:'',clubName:''}); showToast('✅ Panel member assigned.') }
    else showToast('❌ Could not assign panel member.', 'error')
  }
  async function removePanelMember(id) {
    const res = await apiClient.delete(`${API_BASE}/clubs/panel-members/${id}`)
    if(res.ok){setPanelMembers(p=>p.filter(x=>x.id!==id));showToast('Assignment removed.')} else showToast('❌ Could not remove assignment.','error')
  }
  async function deleteNotice(id) { const res=await apiClient.delete(`${API_BASE}/clubs/notices/${id}`); if(res.ok)setNotices(p=>p.filter(x=>x.id!==id)); else showToast('❌ Not permitted.','error') }
  async function toggleNoticePin(notice) { const res=await apiClient.put(`${API_BASE}/clubs/notices/${notice.id}/pin`,{pinned:!notice.pinned}); if(res.ok){const n=await res.json();setNotices(p=>p.map(x=>x.id===n.id?n:x))} }
  async function updateNotice(notice) {
    const title=window.prompt('Notice title',notice.title); if(title===null)return
    const body=window.prompt('Notice content',notice.body); if(body===null)return
    const res=await apiClient.put(`${API_BASE}/clubs/notices/${notice.id}`,{title,body}); if(res.ok){const n=await res.json();setNotices(p=>p.map(x=>x.id===n.id?n:x))} else showToast('❌ Not permitted.','error')
  }
  async function deleteRecruitment(id) { const res=await apiClient.delete(`${API_BASE}/clubs/recruitment/${id}`); if(res.ok)setRecruitments(p=>p.filter(x=>x.id!==id)); else showToast('❌ Not permitted.','error') }
  async function toggleRecruitmentPin(rec) { const res=await apiClient.put(`${API_BASE}/clubs/recruitment/${rec.id}/pin`,{pinned:!rec.pinned}); if(res.ok){const n=await res.json();setRecruitments(p=>p.map(x=>x.id===n.id?n:x))} }
  async function updateRecruitment(rec) {
    const description=window.prompt('Recruitment description',rec.description); if(description===null)return
    const res=await apiClient.put(`${API_BASE}/clubs/recruitment/${rec.id}`,{role:rec.role,description,deadline:rec.deadline,slots:String(rec.slots)}); if(res.ok){const n=await res.json();setRecruitments(p=>p.map(x=>x.id===n.id?n:x))} else showToast('❌ Not permitted.','error')
  }
  async function loadApplications(clubName) { const res=await apiClient.get(`${API_BASE}/clubs/applications?clubName=${encodeURIComponent(clubName)}`); if(res.ok)setApplications(await res.json()); else showToast('❌ Not permitted.','error') }

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

  // Submit application (calls backend API, then moves to confirmation step)
  async function handleApply() {
    const errors = validateStep(applyStep)
    if (Object.keys(errors).length > 0) {
      setApplyErrors(errors)
      return
    }
    setApplySubmitting(true)

    try {
      const payload = {
        recruitmentId: String(applyTarget?.id || ''),
        clubName:      applyTarget?.clubName || '',
        role:          applyTarget?.role     || '',
        studentName:   applyForm.fullName,
        studentEmail:  applyForm.universityEmail,
        motivation:    applyForm.motivation,
      }

      const res = await apiClient.post(`${API_BASE}/clubs/apply`, payload)

      if (res.ok) {
        // Move to confirmation step
        setApplyStep(totalSteps - 1)
        showToast('🎉 Application submitted! The club will contact you soon.')
      } else {
        showToast('❌ Failed to submit application.', 'error')
      }
    } catch (err) {
      console.error('[ClubController] handleApply error:', err)
      showToast('❌ Network error. Please try again.', 'error')
    } finally {
      setApplySubmitting(false)
    }
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
    isPanelMember, assignedClubs, clubs, canManage: isAdmin || isPanelMember,
    panelMembers, assignmentForm, setAssignmentForm, applications,
    // Tab
    activeTab, setActiveTab,
    // Loading
    loading,
    // Data
    notices: sortedNotices,
    recruitments,
    toast,
    // Notice state
    expandedNotice, setExpandedNotice,
    noticeForm, setNoticeForm,
    noticeSubmitting,
    handlePostNotice,
    assignPanelMember, removePanelMember, deleteNotice, toggleNoticePin, updateNotice,
    // Recruitment state
    recruitForm, setRecruitForm,
    recruitSubmitting,
    handlePostRecruitment,
    deleteRecruitment, toggleRecruitmentPin, updateRecruitment, loadApplications,
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

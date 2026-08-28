/**
 * assignmentController.js – Controller layer for the Assignment Submission feature.
 *
 * MVC Role: Controller
 * Manages all state and handlers for assignments, submissions, and file uploads.
 * Used by AssignmentView.
 *
 * API Endpoints used:
 *   GET    /api/assignments              → load all assignments
 *   GET    /api/assignments/{id}         → load assignment detail
 *   POST   /api/assignments              → create assignment (teacher)
 *   POST   /api/assignments/{id}/submit  → turn in work (student)
 *   DELETE /api/assignments/{id}/submit  → unsubmit work (student)
 *   GET    /api/assignments/{id}/submission → get student submission
 *   GET    /api/assignments/{id}/submissions → get all submissions (teacher)
 *   POST   /api/assignments/submissions/{id}/grade → grade submission (teacher)
 */

import { useState, useEffect, useCallback } from 'react'
import {
  EMPTY_CREATE_FORM,
  MAX_FILE_SIZE,
  deriveStatus,
} from '../models/assignmentModel.js'
import * as assignmentService from '../services/assignmentService.js'

/**
 * useAssignmentController
 * Single hook providing all state and actions for the Assignment Submission page.
 */
export function useAssignmentController() {
  const role = (localStorage.getItem('cc_role') || localStorage.getItem('userRole') || 'student').toLowerCase()
  const canManageAssignments = role === 'faculty' || role === 'admin'
  const canViewSubmissions = role === 'faculty' || role === 'admin'
  const canSubmit = role === 'student' || role === 'admin'
  const studentId = localStorage.getItem('cc_userId') || localStorage.getItem('studentId') || 'STU001'
  const studentName = localStorage.getItem('cc_fullName') || localStorage.getItem('studentName') || 'Student'

  // ── Assignments list state ────────────────────────────────────
  const [assignments, setAssignments] = useState([])
  const [showOverdue, setShowOverdue] = useState(false)
  const [overdueCount, setOverdueCount] = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)

  // ── Selected assignment detail ────────────────────────────────
  const [selectedAssignment, setSelectedAssignment] = useState(null)
  const [detailLoading,      setDetailLoading]      = useState(false)

  // ── Current student's submission for the selected assignment ──
  const [submission,      setSubmission]      = useState(null)
  const [submissionLoading, setSubmissionLoading] = useState(false)

  // ── Student: file upload state ────────────────────────────────
  const [uploadedFile,  setUploadedFile]  = useState(null) // File object
  const [turningIn,     setTurningIn]     = useState(false)
  const [unsubmitting,  setUnsubmitting]  = useState(false)
  const [dragActive,    setDragActive]    = useState(false)

  // ── Teacher: create assignment form ───────────────────────────
  const [createForm,     setCreateForm]     = useState({ ...EMPTY_CREATE_FORM })
  const [createFile,     setCreateFile]     = useState(null) // File object
  const [creating,       setCreating]       = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingAssignmentId, setEditingAssignmentId] = useState(null)

  // ── Teacher: submissions list (grading view) ──────────────────
  const [allSubmissions,    setAllSubmissions]    = useState([])
  const [submissionsLoading, setSubmissionsLoading] = useState(false)

  // ── Toast notification ────────────────────────────────────────
  const [toast, setToast] = useState(null)

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // ── Load assignments on mount ─────────────────────────────────
  useEffect(() => {
    loadAssignments(showOverdue)
  }, [showOverdue])

  async function loadAssignments(includeOverdue = showOverdue) {
    setLoading(true)
    setError(null)
    try {
      const data = await assignmentService.getAssignments(includeOverdue)
      setAssignments(data.items)
      setOverdueCount(data.overdueCount)
    } catch (err) {
      console.error('[AssignmentController] Failed to load assignments:', err)
      setError('Failed to load assignments. Please try again.')
      showToast('⚠️ Failed to load assignments.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Select an assignment (load detail + submission) ───────────
  const selectAssignment = useCallback(async (assignmentOrId) => {
    const id = typeof assignmentOrId === 'object' ? assignmentOrId.id : assignmentOrId
    setDetailLoading(true)
    setSubmission(null)
    setUploadedFile(null)
    setAllSubmissions([])

    try {
      const detail = await assignmentService.getAssignment(id)
      setSelectedAssignment(detail)

      // Load student's submission for this assignment
      if (canSubmit) {
        setSubmissionLoading(true)
        try {
          const sub = await assignmentService.getSubmission(id, studentId)
          setSubmission(sub)
        } catch (e) {
          console.error('[AssignmentController] Failed to load submission:', e)
        } finally {
          setSubmissionLoading(false)
        }
      }

      // Teacher: load all submissions
      if (canViewSubmissions) {
        setSubmissionsLoading(true)
        try {
          const subs = await assignmentService.getSubmissions(id)
          setAllSubmissions(subs)
        } catch (e) {
          console.error('[AssignmentController] Failed to load submissions:', e)
        } finally {
          setSubmissionsLoading(false)
        }
      }
    } catch (err) {
      console.error('[AssignmentController] Failed to load assignment detail:', err)
      showToast('⚠️ Failed to load assignment details.', 'error')
    } finally {
      setDetailLoading(false)
    }
  }, [canSubmit, canViewSubmissions, studentId])

  // ── Back to list ──────────────────────────────────────────────
  const backToList = useCallback(() => {
    setSelectedAssignment(null)
    setSubmission(null)
    setUploadedFile(null)
    setAllSubmissions([])
  }, [])

  // ── Student: File upload handlers ─────────────────────────────
  const handleFileSelect = useCallback((file) => {
    if (!file) return

    if (file.size > MAX_FILE_SIZE) {
      showToast('⚠️ File is too large. Maximum size is 10 MB.', 'error')
      return
    }

    setUploadedFile(file)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer?.files?.[0]
    handleFileSelect(file)
  }, [handleFileSelect])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragActive(false)
  }, [])

  const removeFile = useCallback(() => {
    setUploadedFile(null)
  }, [])

  // ── Student: Turn In ──────────────────────────────────────────
  const handleTurnIn = useCallback(async () => {
    if (!selectedAssignment || !uploadedFile) return

    setTurningIn(true)
    try {
      const formData = new FormData()
      formData.append('studentId',   studentId)
      formData.append('studentName', studentName)
      formData.append('file',        uploadedFile)

      const result = await assignmentService.submitWork(selectedAssignment.id, formData)
      setSubmission(result)
      setUploadedFile(null)
      showToast('✅ Work turned in successfully!')
    } catch (err) {
      console.error('[AssignmentController] Turn in failed:', err)
      showToast(`⚠️ ${err.message}`, 'error')
    } finally {
      setTurningIn(false)
    }
  }, [selectedAssignment, uploadedFile, studentId, studentName])

  // ── Student: Unsubmit ─────────────────────────────────────────
  const handleUnsubmit = useCallback(async () => {
    if (!selectedAssignment) return

    setUnsubmitting(true)
    try {
      await assignmentService.unsubmitWork(selectedAssignment.id, studentId)
      setSubmission(null)
      setUploadedFile(null)
      showToast('Work unsubmitted. You can resubmit before the deadline.')
    } catch (err) {
      console.error('[AssignmentController] Unsubmit failed:', err)
      showToast(`⚠️ ${err.message}`, 'error')
    } finally {
      setUnsubmitting(false)
    }
  }, [selectedAssignment, studentId])

  // ── Teacher: Create assignment form handlers ──────────────────
  const updateCreateForm = useCallback((field, value) => {
    setCreateForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleCourseSelect = useCallback((code, name) => {
    setCreateForm(prev => ({ ...prev, courseCode: code, courseName: name }))
  }, [])

  const handleCreateFileSelect = useCallback((file) => {
    if (file && file.size > MAX_FILE_SIZE) {
      showToast('⚠️ File is too large. Maximum size is 10 MB.', 'error')
      return
    }
    setCreateFile(file)
  }, [])

  const handleCreateAssignment = useCallback(async () => {
    if (!createForm.title || !createForm.courseCode || !createForm.deadline) {
      showToast('⚠️ Please fill in title, course, and deadline.', 'error')
      return
    }

    setCreating(true)
    try {
      const formData = new FormData()
      formData.append('courseCode',   createForm.courseCode)
      formData.append('courseName',  createForm.courseName)
      formData.append('title',       createForm.title)
      formData.append('description', createForm.description || '')
      formData.append('deadline',    createForm.deadline)
      formData.append('createdBy',   createForm.createdBy || 'Teacher')
      if (createFile) {
        formData.append('file', createFile)
      }

      const updated = editingAssignmentId
        ? await assignmentService.updateAssignment(editingAssignmentId, formData)
        : await assignmentService.createAssignment(formData)
      if (editingAssignmentId) setSelectedAssignment(updated)
      showToast('✅ Assignment created successfully!')

      // Reset form and reload list
      setCreateForm({ ...EMPTY_CREATE_FORM })
      setCreateFile(null)
      setShowCreateForm(false)
      setEditingAssignmentId(null)
      await loadAssignments()
    } catch (err) {
      console.error('[AssignmentController] Create failed:', err)
      showToast(`⚠️ ${err.message}`, 'error')
    } finally {
      setCreating(false)
    }
  }, [createForm, createFile, editingAssignmentId])

  const openEditAssignment = useCallback((assignment) => {
    setEditingAssignmentId(assignment.id)
    setCreateForm({
      courseCode: assignment.courseCode || '', courseName: assignment.courseName || '',
      title: assignment.title || '', description: assignment.description || '',
      deadline: assignment.deadline ? assignment.deadline.slice(0, 16) : '',
      createdBy: assignment.createdBy || '',
    })
    setCreateFile(null)
    setShowCreateForm(true)
  }, [])

  const handleDownload = useCallback(async (url, fileName) => {
    try {
      await assignmentService.downloadProtectedFile(url, fileName)
    } catch (err) {
      showToast(err.message, 'error')
    }
  }, [])

  const closeAssignmentForm = useCallback(() => {
    setShowCreateForm(false)
    setEditingAssignmentId(null)
    setCreateFile(null)
  }, [])

  // ── Derived state ─────────────────────────────────────────────
  // Compute status for each assignment in the list (for student)
  const assignmentsWithStatus = assignments.map(a => ({
    ...a,
    // Status will be properly computed when detail is selected
    deadlineStatus: null,
  }))

  return {
    // Role
    canManageAssignments,
    canViewSubmissions,
    canSubmit,
    studentId,

    // Assignments list
    assignments: assignmentsWithStatus,
    loading,
    error,
    showOverdue,
    setShowOverdue,
    overdueCount,

    // Selected assignment
    selectedAssignment,
    detailLoading,
    selectAssignment,
    backToList,

    // Student submission
    submission,
    submissionLoading,

    // Student file upload
    uploadedFile,
    turningIn,
    unsubmitting,
    dragActive,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    removeFile,
    handleTurnIn,
    handleUnsubmit,
    handleDownload,

    // Teacher: create form
    createForm,
    createFile,
    creating,
    showCreateForm,
    setShowCreateForm,
    editingAssignmentId,
    openEditAssignment,
    closeAssignmentForm,
    updateCreateForm,
    handleCourseSelect,
    handleCreateFileSelect,
    handleCreateAssignment,

    // Teacher: submissions list
    allSubmissions,
    submissionsLoading,

    // Toast
    toast,
  }
}

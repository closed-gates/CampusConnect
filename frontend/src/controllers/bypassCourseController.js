/**
 * bypassCourseController.js – Controller hook for Course Bypass & CGPA Management.
 *
 * MVC Role: Controller
 * Manages all state, async fetching, validation, and actions for BypassCourseView.
 */

import { useState, useEffect, useCallback } from 'react'
import { INITIAL_BYPASS_FORM, GRADE_OPTIONS } from '../models/bypassCourseModel.js'
import { bypassCourseService } from '../services/bypassCourseService.js'
import { courseService } from '../services/courseService.js'
import { getStoredUser } from '../models/authModel.js'

export function useBypassCourseController() {
  const [students, setStudents]                   = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [studentHistory, setStudentHistory]       = useState(null)
  const [catalogCourses, setCatalogCourses]       = useState([])
  const [form, setForm]                           = useState(INITIAL_BYPASS_FORM)
  const [loading, setLoading]                     = useState(true)
  const [historyLoading, setHistoryLoading]       = useState(false)
  const [submitting, setSubmitting]               = useState(false)
  const [toast, setToast]                         = useState(null)
  const [toastType, setToastType]                 = useState('success') // 'success' | 'error'

  const user = getStoredUser()

  const showToast = useCallback((msg, type = 'success') => {
    setToast(msg)
    setToastType(type)
    setTimeout(() => setToast(null), 4000)
  }, [])

  /* ── 1. Initial Data Load ──────────────────────────────────── */
  const loadInitialData = useCallback(async () => {
    setLoading(true)
    try {
      const [studentList, catalog] = await Promise.all([
        bypassCourseService.getStudents().catch(() => []),
        courseService.getCatalog().catch(() => [])
      ])
      setStudents(studentList)
      setCatalogCourses(catalog)

      if (studentList.length > 0) {
        const firstId = studentList[0].studentId
        setSelectedStudentId(firstId)
        setForm(prev => ({ ...prev, studentId: firstId }))
        loadStudentHistory(firstId)
      }
    } catch (err) {
      showToast('Error loading students and courses: ' + err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  /* ── 2. Load Selected Student History ──────────────────────── */
  const loadStudentHistory = async (studentId) => {
    if (!studentId) return
    setHistoryLoading(true)
    try {
      const data = await bypassCourseService.getStudentHistory(studentId)
      if (data.success) {
        setStudentHistory(data)
      }
    } catch (err) {
      showToast('Could not load student history', 'error')
    } finally {
      setHistoryLoading(false)
    }
  }

  /* ── 3. Handlers ───────────────────────────────────────────── */
  const handleSelectStudent = (studentId) => {
    setSelectedStudentId(studentId)
    setForm(prev => ({ ...prev, studentId }))
    loadStudentHistory(studentId)
  }

  const handleFieldChange = (field, value) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }

      // Auto-fill course title and credits from catalog if courseCode changes
      if (field === 'courseCode') {
        const upper = String(value).toUpperCase().trim()
        const matched = catalogCourses.find(c => c.code === upper)
        if (matched) {
          next.courseTitle = matched.name || matched.title || ''
          next.credits = matched.credits || 3
        }
      }
      return next
    })
  }

  const handleBypassSubmit = async (e) => {
    if (e) e.preventDefault()
    if (!form.studentId || !form.courseCode.trim()) {
      showToast('Please select a student and provide a course code.', 'error')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        ...form,
        courseCode: form.courseCode.trim().toUpperCase(),
        bypassedBy: user?.fullName ? `${user.fullName} (${user.userId})` : 'Admin',
      }

      const res = await bypassCourseService.bypassCourse(payload)
      if (res.success) {
        showToast(res.message || 'Course bypassed and credits added successfully!', 'success')
        // Refresh student history and students list
        await Promise.all([
          loadStudentHistory(form.studentId),
          bypassCourseService.getStudents().then(setStudents).catch(() => {})
        ])
        // Reset course-specific form fields
        setForm(prev => ({
          ...prev,
          courseCode: '',
          courseTitle: '',
          credits: 3,
          grade: 'A',
          reason: 'Credit Transfer from External Institution'
        }))
      } else {
        showToast(res.message || 'Failed to bypass course.', 'error')
      }
    } catch (err) {
      showToast('Network error while submitting bypass: ' + err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteBypass = async (recordId) => {
    if (!selectedStudentId || !recordId) return
    try {
      const res = await bypassCourseService.deleteBypassRecord(selectedStudentId, recordId)
      if (res.success) {
        showToast(res.message || 'Bypass record removed and CGPA updated.', 'success')
        await Promise.all([
          loadStudentHistory(selectedStudentId),
          bypassCourseService.getStudents().then(setStudents).catch(() => {})
        ])
      } else {
        showToast(res.message || 'Could not remove record.', 'error')
      }
    } catch (err) {
      showToast('Error removing bypass record', 'error')
    }
  }

  return {
    students,
    selectedStudentId,
    studentHistory,
    catalogCourses,
    form,
    loading,
    historyLoading,
    submitting,
    toast,
    toastType,
    GRADE_OPTIONS,
    handleSelectStudent,
    handleFieldChange,
    handleBypassSubmit,
    handleDeleteBypass,
    refreshHistory: () => loadStudentHistory(selectedStudentId)
  }
}

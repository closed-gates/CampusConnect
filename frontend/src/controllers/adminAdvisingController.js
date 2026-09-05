import { useState, useEffect, useCallback } from 'react'
import { adminAdvisingService } from '../services/adminAdvisingService.js'

/**
 * useAdminAdvisingController – Custom hook managing Admin section creation,
 * bypass enrolment, and the global advising portal open/close toggle.
 *
 * MVC Role: Controller
 */
export function useAdminAdvisingController({ onSectionCreated, onStudentEnrolled } = {}) {
  // Section creation state
  const [sectionForm, setSectionForm] = useState({
    code: '',
    section: '',
    title: '',
    faculty: '',
    time: '',
    room: '',
    totalSeats: 35,
    credits: 3.0,
    examDay: '',
  })
  const [creatingSection, setCreatingSection] = useState(false)

  // Force registration state
  const [bypassForm, setBypassForm] = useState({
    studentId: '',
    sectionId: '',
  })
  const [enrollingBypass, setEnrollingBypass] = useState(false)

  // ── Advising Portal Toggle state ────────────────────────────────
  const [isPortalOpen,    setIsPortalOpen]    = useState(null)
  const [portalError, setPortalError] = useState(null)
  const [portalMessage,   setPortalMessage]   = useState('')
  const [portalUpdatedBy, setPortalUpdatedBy] = useState('')
  const [portalUpdatedAt, setPortalUpdatedAt] = useState('')
  const [portalLoading,   setPortalLoading]   = useState(false)
  const [portalUpdating,  setPortalUpdating]  = useState(false)
  const [customMessage,   setCustomMessage]   = useState('')

  const [toast,     setToast]     = useState(null)
  const [toastType, setToastType] = useState('success')

  const showToast = (msg, type = 'success') => {
    setToast(msg)
    setToastType(type)
    setTimeout(() => setToast(null), 4000)
  }

  // Load portal status on mount
  const loadPortalStatus = useCallback(async () => {
    setPortalLoading(true)
    setPortalError(null)
    try {
      const data = await adminAdvisingService.getPortalStatus()
      setIsPortalOpen(data.isOpen !== false)
      setPortalMessage(data.message || '')
      setCustomMessage(data.message || '')
      setPortalUpdatedBy(data.updatedBy || '')
      setPortalUpdatedAt(data.updatedAt || '')
    } catch (error) {
      setIsPortalOpen(null)
      setPortalError(error.message)
    } finally {
      setPortalLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPortalStatus()
  }, [loadPortalStatus])

  const handleTogglePortal = async (open, msgOverride) => {
    if (portalUpdating || portalLoading || isPortalOpen === null) return
    setPortalUpdating(true)
    try {
      const msg = msgOverride !== undefined ? msgOverride : customMessage
      const data = await adminAdvisingService.setPortalStatus(open, msg)
      setIsPortalOpen(data.isOpen)
      setPortalMessage(data.message || '')
      setPortalUpdatedBy(data.updatedBy || '')
      setPortalUpdatedAt(data.updatedAt || '')
      showToast(
        open === isPortalOpen ? 'Student notice updated.' : open ? '✅ Advising portal is now OPEN. Student advising windows still apply.' : '🔒 Advising portal has been CLOSED.',
        open ? 'success' : 'error'
      )
    } catch (err) {
      showToast(err.message || 'Failed to update portal status', 'error')
    } finally {
      setPortalUpdating(false)
    }
  }

  const handleSectionFieldChange = (field, value) => {
    setSectionForm(prev => ({ ...prev, [field]: value }))
  }

  const handleBypassFieldChange = (field, value) => {
    setBypassForm(prev => ({ ...prev, [field]: value }))
  }

  const handleCreateSection = async (e) => {
    if (e) e.preventDefault()
    if (!sectionForm.code || !sectionForm.section) {
      showToast('Course code and section number are required.', 'error')
      return
    }

    setCreatingSection(true)
    try {
      const res = await adminAdvisingService.createCourseSection(sectionForm)
      showToast(res.message, 'success')
      setSectionForm({
        code: '',
        section: '',
        title: '',
        faculty: '',
        time: '',
        room: '',
        totalSeats: 35,
        credits: 3.0,
        examDay: '',
      })
      if (onSectionCreated) onSectionCreated(res.section)
    } catch (err) {
      showToast(err.message || 'Error creating course section', 'error')
    } finally {
      setCreatingSection(false)
    }
  }

  const handleForceRegister = async (e) => {
    if (e) e.preventDefault()
    if (!bypassForm.studentId || !bypassForm.sectionId) {
      showToast('Student ID and Section ID are required.', 'error')
      return
    }

    setEnrollingBypass(true)
    try {
      const res = await adminAdvisingService.forceRegisterStudent(
        bypassForm.studentId.trim(),
        bypassForm.sectionId.trim()
      )
      showToast(res.message, 'success')
      setBypassForm({ studentId: '', sectionId: '' })
      if (onStudentEnrolled) onStudentEnrolled(res)
    } catch (err) {
      showToast(err.message || 'Error force enrolling student', 'error')
    } finally {
      setEnrollingBypass(false)
    }
  }

  return {
    sectionForm,
    creatingSection,
    handleSectionFieldChange,
    handleCreateSection,
    bypassForm,
    enrollingBypass,
    handleBypassFieldChange,
    handleForceRegister,
    // Portal toggle
    isPortalOpen,
    portalMessage,
    portalUpdatedBy,
    portalUpdatedAt,
    portalLoading,
    portalUpdating,
    portalError,
    loadPortalStatus,
    customMessage,
    setCustomMessage,
    handleTogglePortal,
    toast,
    toastType,
  }
}

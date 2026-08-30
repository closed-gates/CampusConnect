import { useState } from 'react'
import { adminAdvisingService } from '../services/adminAdvisingService.js'

/**
 * useAdminAdvisingController – Custom hook managing Admin section creation and bypass enrolment.
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

  const [toast,     setToast]     = useState(null)
  const [toastType, setToastType] = useState('success')

  const showToast = (msg, type = 'success') => {
    setToast(msg)
    setToastType(type)
    setTimeout(() => setToast(null), 3500)
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
    toast,
    toastType,
  }
}

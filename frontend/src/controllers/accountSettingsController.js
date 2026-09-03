import { useState, useEffect, useCallback } from 'react'
import {
  INITIAL_PROFILE,
  INITIAL_EDIT_FORM,
  INITIAL_PASSWORD_FORM,
  loadPreferences,
  savePreferences,
  scorePassword,
} from '../models/accountSettingsModel.js'
import { clearAuth, getStoredUser, storeAuth, getStoredToken } from '../models/authModel.js'
import apiClient from '../services/apiClient.js'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

async function getErrorMessage(response, fallback) {
  try {
    const body = await response.json()
    return body.message || body.error || fallback
  } catch {
    return fallback
  }
}

/**
 * accountSettingsController.js - Controller hook for Account Preferences & Settings.
 *
 * MVC Role: Controller (custom React hook)
 *
 * Responsibilities:
 *   - Load profile from authenticated GET /api/account/profile
 *   - Handle profile edit (fullName, email) via authenticated PUT /api/account/profile
 *   - Handle password change via authenticated PUT /api/account/password
 *   - Load/save preferences (theme and notification muting) from/to localStorage
 *
 * Returns state and handlers consumed by AccountSettingsView.
 */
export function useAccountSettingsController() {
  const [storedUser] = useState(getStoredUser)

  // ── State ────────────────────────────────────────────────────────────────────
  const [profile,       setProfile]      = useState(INITIAL_PROFILE)
  const [editForm,      setEditForm]     = useState(INITIAL_EDIT_FORM)
  const [passwordForm,  setPasswordForm] = useState(INITIAL_PASSWORD_FORM)
  const [preferences,   setPreferences]  = useState(loadPreferences())
  const [activeTab,     setActiveTab]    = useState('profile')
  const [loading,       setLoading]      = useState(true)
  const [saving,        setSaving]       = useState(false)
  const [editMode,      setEditMode]     = useState(false)
  const [profileError,  setProfileError] = useState('')
  const [profileSuccess,setProfileSuccess]= useState('')
  const [passwordError, setPasswordError]= useState('')
  const [passwordSuccess,setPasswordSuccess]= useState('')
  const [passwordStrength, setPasswordStrength] = useState(null)
  const [preferenceError, setPreferenceError] = useState('')

  // ── Load profile on mount ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!storedUser?.userId) { setLoading(false); return }
    apiClient.get('/api/account/profile')
      .then(r => {
        if (!r.ok) throw new Error('Failed to load profile')
        return r.json()
      })
      .then(data => {
        setProfile(data)
        setEditForm({ fullName: data.fullName || '', email: data.email || '' })
        if (Number.isFinite(data.reminderHours)) {
          setPreferences(prev => {
            const next = { ...prev, calendar: { ...prev.calendar, reminderHours: data.reminderHours } }
            savePreferences(next)
            return next
          })
        }
      })
      .catch((error) => {
        // Fallback to localStorage data
        setProfile({
          ...INITIAL_PROFILE,
          userId:   storedUser.userId   || '',
          fullName: storedUser.fullName || '',
          email:    storedUser.email    || '',
          role:     storedUser.role     || '',
        })
        setEditForm({ fullName: storedUser.fullName || '', email: storedUser.email || '' })
        setProfileError(error.message || 'Could not load the latest profile data.')
      })
      .finally(() => setLoading(false))
  }, [storedUser])

  // ── Apply theme preference ────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', preferences.theme)
  }, [preferences.theme])

  // ── Handlers: profile edit form ───────────────────────────────────────────────
  const handleEditChange = useCallback((field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleEnterEditMode = useCallback(() => {
    setEditMode(true)
    setProfileError('')
    setProfileSuccess('')
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditForm({ fullName: profile.fullName, email: profile.email })
    setEditMode(false)
    setProfileError('')
  }, [profile])

  const handleSaveProfile = useCallback(async () => {
    if (!editForm.fullName.trim()) {
      setProfileError('Full name cannot be empty.')
      return
    }
    setSaving(true)
    setProfileError('')
    setProfileSuccess('')
    try {
      const res = await apiClient.put('/api/account/profile', {
        fullName: editForm.fullName.trim(),
        email: editForm.email.trim(),
      })
      if (!res.ok) {
        throw new Error(await getErrorMessage(res, 'Failed to save profile'))
      }
      const updated = await res.json()
      setProfile(updated)
      setEditMode(false)
      setProfileSuccess('Profile updated successfully!')
      // Update localStorage so sidebar reflects new name
      storeAuth({
        token:     getStoredToken(),
        role:      updated.role,
        userId:    updated.userId,
        fullName:  updated.fullName,
        email:     updated.email,
        isAdvisor: updated.isAdvisor,
      })
    } catch (err) {
      setProfileError(err.message || 'Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }, [editForm])

  // ── Handlers: password form ───────────────────────────────────────────────────
  const handlePasswordChange = useCallback((field, value) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }))
    if (field === 'newPassword') {
      setPasswordStrength(scorePassword(value))
    }
  }, [])

  const handleChangePassword = useCallback(async () => {
    setPasswordError('')
    setPasswordSuccess('')
    const { currentPassword, newPassword, confirmPassword } = passwordForm
    if (!currentPassword) { setPasswordError('Current password is required.'); return }
    if (newPassword.length < 8) { setPasswordError('New password must be at least 8 characters.'); return }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return }

    setSaving(true)
    try {
      const res = await apiClient.put('/api/account/password', { currentPassword, newPassword })
      if (!res.ok) {
        throw new Error(await getErrorMessage(res, 'Failed to change password'))
      }
      setPasswordForm(INITIAL_PASSWORD_FORM)
      setPasswordStrength(null)
      setPasswordSuccess('Password changed successfully!')
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password.')
    } finally {
      setSaving(false)
    }
  }, [passwordForm])

  // ── Handlers: preferences ─────────────────────────────────────────────────────
  const handlePreferenceChange = useCallback((key, value) => {
    setPreferences(prev => {
      const next = { ...prev, [key]: value }
      savePreferences(next)
      return next
    })
  }, [])

  const handleNestedPreferenceChange = useCallback((group, key, value) => {
    setPreferences(prev => {
      const next = { ...prev, [group]: { ...prev[group], [key]: value } }
      savePreferences(next)
      return next
    })
  }, [])

  const handleReminderHoursChange = useCallback(async value => {
    const reminderHours = Number(value)
    setPreferenceError('')
    try {
      const res = await apiClient.put('/api/account/preferences/reminder', { reminderHours })
      if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to update reminder timing'))
      handleNestedPreferenceChange('calendar', 'reminderHours', reminderHours)
    } catch (err) {
      setPreferenceError(err.message || 'Failed to update reminder timing.')
    }
  }, [handleNestedPreferenceChange])

  const handleAvatarChange = useCallback((file) => {
    if (!file) return
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
      setProfileError('Profile photo must be an image smaller than 2 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => handlePreferenceChange('avatar', reader.result)
    reader.readAsDataURL(file)
  }, [handlePreferenceChange])

  const handleExportData = useCallback(() => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
    const teal = [26, 152, 130]
    const navy = [15, 43, 61]
    const text = [31, 41, 55]
    const muted = [100, 116, 139]
    const yesNo = value => value ? 'Yes' : 'No'
    const valueOrDash = value => value === null || value === undefined || value === '' ? '—' : String(value)

    const initials = String(profile.fullName || profile.userId || 'CC')
      .trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join('')

    doc.setFillColor(...navy)
    doc.rect(0, 0, 595, 118, 'F')
    doc.setFillColor(...teal)
    doc.rect(0, 112, 595, 6, 'F')
    doc.setDrawColor(255, 255, 255)
    doc.setLineWidth(2)
    doc.circle(68, 57, 27, 'S')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(255, 255, 255)
    doc.text(initials || 'CC', 68, 62, { align: 'center' })
    doc.setFontSize(22)
    doc.text('CampusConnect', 110, 48)
    doc.setFontSize(12)
    doc.setTextColor(204, 251, 241)
    doc.text('OFFICIAL ACCOUNT PROFILE', 110, 68)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(226, 232, 240)
    doc.text(`Generated ${new Date().toLocaleString()}`, 110, 86)

    doc.setFillColor(240, 253, 250)
    doc.setDrawColor(153, 246, 228)
    doc.roundedRect(40, 142, 515, 70, 7, 7, 'FD')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(...navy)
    doc.text(valueOrDash(profile.fullName), 58, 169)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(...muted)
    doc.text(`${valueOrDash(profile.role)}  •  ${valueOrDash(profile.userId)}`, 58, 189)

    const addSection = (title, rows, startY) => {
      doc.setFillColor(...teal)
      doc.roundedRect(40, startY - 13, 5, 18, 2, 2, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.setTextColor(...navy)
      doc.text(title, 53, startY)
      autoTable(doc, {
        startY: startY + 12,
        body: rows,
        margin: { left: 40, right: 40 },
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 8, textColor: text, lineColor: [226, 232, 240], lineWidth: { bottom: 0.5 } },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { cellWidth: 165, fontStyle: 'bold', textColor: muted },
          1: { textColor: text },
        },
      })
      return doc.lastAutoTable.finalY + 32
    }

    let nextY = addSection('Profile Information', [
      ['User ID', valueOrDash(profile.userId)],
      ['Full name', valueOrDash(profile.fullName)],
      ['Email', valueOrDash(profile.email)],
      ['Role', valueOrDash(profile.role)],
      ['Member since', valueOrDash(profile.createdAt)],
      ['Advisor', yesNo(profile.isAdvisor)],
    ], 244)

    if (String(profile.role).toUpperCase() === 'STUDENT') {
      nextY = addSection('Academic Profile', [
        ['Department', valueOrDash(profile.department)],
        ['Year', valueOrDash(profile.year)],
        ['CGPA', valueOrDash(profile.cgpa)],
        ['Completed credits', valueOrDash(profile.completedCredits)],
        ['Course limit', valueOrDash(profile.courseLimit)],
        ['Credit limit', valueOrDash(profile.creditLimit)],
        ['On probation', yesNo(profile.onProbation)],
      ], nextY)
    }

    const pageCount = doc.getNumberOfPages()
    for (let page = 1; page <= pageCount; page += 1) {
      doc.setPage(page)
      doc.setDrawColor(203, 213, 225)
      doc.line(40, 806, 555, 806)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...muted)
      doc.text('CampusConnect • Confidential account profile', 40, 822)
      doc.text(`Page ${page} of ${pageCount}`, 555, 822, { align: 'right' })
    }

    doc.save(`campusconnect-${profile.userId || 'account'}-profile.pdf`)
  }, [profile])

  const handleResetPreferences = useCallback(async () => {
    setPreferenceError('')
    try {
      const res = await apiClient.put('/api/account/preferences/reminder', { reminderHours: 24 })
      if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to reset reminder timing'))
      localStorage.removeItem('cc_preferences')
      const next = loadPreferences()
      savePreferences(next)
      setPreferences(next)
    } catch (err) {
      setPreferenceError(err.message || 'Failed to reset preferences.')
    }
  }, [])

  const handleDeactivateAccount = useCallback(async () => {
    if (!window.confirm('Deactivate your CampusConnect account? You will no longer be able to sign in.')) return
    const res = await apiClient.delete('/api/account')
    if (!res.ok) throw new Error(await getErrorMessage(res, 'Failed to deactivate account'))
    clearAuth()
    window.location.href = '/'
  }, [])

  const handleSignOut = useCallback(() => {
    clearAuth()
    window.location.href = '/'
  }, [])

  // ── Return ─────────────────────────────────────────────────────────────────────
  return {
    // state
    profile, editForm, passwordForm, preferences,
    activeTab, loading, saving, editMode,
    profileError, profileSuccess,
    passwordError, passwordSuccess,
    passwordStrength,
    preferenceError,
    // handlers
    setActiveTab,
    handleEditChange,
    handleEnterEditMode,
    handleCancelEdit,
    handleSaveProfile,
    handlePasswordChange,
    handleChangePassword,
    handlePreferenceChange,
    handleNestedPreferenceChange,
    handleReminderHoursChange,
    handleAvatarChange,
    handleExportData,
    handleResetPreferences,
    handleDeactivateAccount,
    handleSignOut,
  }
}

import { useCallback, useEffect, useState } from 'react'
import apiClient from '../services/apiClient.js'
import { EMPTY_ADMIN_PROFILE, buildAdminProfilePayload, profileToAdminForm } from '../models/adminProfileManagementModel.js'

async function errorMessage(response, fallback) {
  try { const body = await response.json(); return body.message || body.error || fallback } catch { return fallback }
}

export function useAdminProfileManagementController() {
  const [query, setQuery] = useState('')
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState(EMPTY_ADMIN_PROFILE)
  const [avatar, setAvatar] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => () => { if (avatar) URL.revokeObjectURL(avatar) }, [avatar])

  const loadAvatar = useCallback(async userId => {
    const response = await apiClient.get(`/api/admin/profile-management/${encodeURIComponent(userId)}/profile-picture`)
    if (response.status === 404) { setAvatar(''); return }
    if (!response.ok) return
    setAvatar(URL.createObjectURL(await response.blob()))
  }, [])

  const search = useCallback(async event => {
    event?.preventDefault()
    const userId = query.trim().toUpperCase()
    if (!userId) { setError('Enter a user ID.'); return }
    setLoading(true); setError(''); setSuccess(''); setProfile(null); setAvatar('')
    try {
      const response = await apiClient.get(`/api/admin/profile-management/${encodeURIComponent(userId)}`)
      if (!response.ok) throw new Error(await errorMessage(response, 'User not found.'))
      const found = await response.json()
      setProfile(found); setForm(profileToAdminForm(found)); await loadAvatar(found.userId)
    } catch (err) { setError(err.message || 'Could not load this user.') }
    finally { setLoading(false) }
  }, [query, loadAvatar])

  const change = useCallback((field, value) => setForm(current => ({ ...current, [field]: value })), [])

  const save = useCallback(async () => {
    if (!profile) return
    setSaving(true); setError(''); setSuccess('')
    try {
      const response = await apiClient.put(`/api/admin/profile-management/${encodeURIComponent(profile.userId)}`, buildAdminProfilePayload(form))
      if (!response.ok) throw new Error(await errorMessage(response, 'Could not update profile.'))
      const updated = await response.json()
      setProfile(updated); setForm(profileToAdminForm(updated)); setSuccess(`${updated.userId} updated successfully.`)
    } catch (err) { setError(err.message || 'Could not update profile.') }
    finally { setSaving(false) }
  }, [form, profile])

  const uploadAvatar = useCallback(async file => {
    if (!profile || !file) return
    if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) { setError('Profile photo must be an image smaller than 2 MB.'); return }
    setSaving(true); setError(''); setSuccess('')
    const data = new FormData(); data.append('file', file)
    try {
      const response = await apiClient.upload(`/api/admin/profile-management/${encodeURIComponent(profile.userId)}/profile-picture`, data, 'PUT')
      if (!response.ok) throw new Error(await errorMessage(response, 'Could not save profile photo.'))
      setAvatar(URL.createObjectURL(file)); setSuccess(`Profile photo saved for ${profile.userId}.`)
    } catch (err) { setError(err.message || 'Could not save profile photo.') }
    finally { setSaving(false) }
  }, [profile])

  return { query, setQuery, profile, form, avatar, loading, saving, error, success, search, change, save, uploadAvatar }
}

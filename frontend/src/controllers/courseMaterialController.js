/**
 * courseMaterialController.js – state and handlers for course materials.
 *
 * MVC Role: Controller
 */

import { useCallback, useEffect, useState } from 'react'
import { getStoredRole } from '../models/authModel.js'
import {
  EMPTY_MATERIAL_FORM,
  KIND_OPTIONS,
  blobTypeForPreview,
  courseNameForCode,
  isAllowedMaterialFile,
  previewMode,
  toCourseOptions,
} from '../models/courseMaterialModel.js'
import * as courseMaterialService from '../services/courseMaterialService.js'
import { getCatalog } from '../services/courseService.js'

export function useCourseMaterialController() {
  const role = (getStoredRole() || 'STUDENT').toUpperCase()
  const canManage = role === 'FACULTY' || role === 'ADMIN'

  const [materials, setMaterials] = useState([])
  const [courseOptions, setCourseOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [courseFilter, setCourseFilter] = useState('ALL')
  const [kindFilter, setKindFilter] = useState('ALL')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [createForm, setCreateForm] = useState({ ...EMPTY_MATERIAL_FORM })
  const [createFile, setCreateFile] = useState(null)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [downloadingId, setDownloadingId] = useState(null)
  const [viewingId, setViewingId] = useState(null)
  const [preview, setPreview] = useState(null)
  const [toast, setToast] = useState(null)

  function showToast(message, type = 'success') {
    setToast({ message, type })
    window.setTimeout(() => setToast(null), 4000)
  }

  const loadMaterials = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await courseMaterialService.getMaterials()
      setMaterials(data)
    } catch (err) {
      setError(err.message || 'Could not load course materials.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadMaterials()
  }, [loadMaterials])

  useEffect(() => {
    let cancelled = false
    getCatalog()
      .then(data => {
        if (!cancelled) setCourseOptions(toCourseOptions(data))
      })
      .catch(() => {
        if (!cancelled) setCourseOptions([])
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    return () => {
      if (preview?.url) URL.revokeObjectURL(preview.url)
    }
  }, [preview])

  function handleFormChange(event) {
    const { name, value } = event.target
    setCreateForm(prev => {
      const next = { ...prev, [name]: value }
      if (name === 'courseCode') next.courseName = courseNameForCode(value, courseOptions)
      return next
    })
  }

  function handleFileSelect(event) {
    const file = event.target.files?.[0]
    if (!file) {
      setCreateFile(null)
      return
    }
    if (!isAllowedMaterialFile(file)) {
      showToast('Use PDF, slides, Word, Excel, ZIP, text, or images up to 25 MB.', 'error')
      event.target.value = ''
      setCreateFile(null)
      return
    }
    setCreateFile(file)
  }

  async function handleCreate(event) {
    event.preventDefault()
    if (!canManage) return
    if (!createForm.title.trim()) {
      showToast('Title is required.', 'error')
      return
    }
    if (!createForm.courseCode) {
      showToast('Select a course.', 'error')
      return
    }
    if (!createFile) {
      showToast('Choose a file to upload.', 'error')
      return
    }
    setCreating(true)
    try {
      const formData = new FormData()
      formData.append('title', createForm.title.trim())
      formData.append('description', createForm.description.trim())
      formData.append('courseCode', createForm.courseCode)
      formData.append('courseName', createForm.courseName)
      formData.append('kind', createForm.kind)
      formData.append('file', createFile)
      const created = await courseMaterialService.createMaterial(formData)
      setMaterials(prev => [created, ...prev])
      setShowUploadForm(false)
      setCreateForm({ ...EMPTY_MATERIAL_FORM })
      setCreateFile(null)
      showToast('Material uploaded.')
    } catch (err) {
      showToast(err.message || 'Could not upload the material.', 'error')
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id) {
    if (!canManage) return
    setDeletingId(id)
    try {
      await courseMaterialService.deleteMaterial(id)
      setMaterials(prev => prev.filter(item => item.id !== id))
      showToast('Material deleted.')
    } catch (err) {
      showToast(err.message || 'Could not delete the material.', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleView(material) {
    setViewingId(material.id)
    try {
      const file = await courseMaterialService.fetchMaterialFile(material.id, 'view')
      const type = blobTypeForPreview(material.originalFilename, file.contentType || material.contentType)
      const blob = new Blob([file.buffer], { type })
      const url = URL.createObjectURL(blob)
      const mode = previewMode(material.originalFilename, type)
      let textContent = ''
      if (mode === 'text') {
        textContent = await blob.text()
      }
      setPreview({ material, url, mode, textContent })
    } catch (err) {
      showToast(err.message || 'Could not open the file.', 'error')
    } finally {
      setViewingId(null)
    }
  }

  function closePreview() {
    setPreview(null)
  }

  async function handleDownload(material) {
    setDownloadingId(material.id)
    try {
      const { blob, filename } = await courseMaterialService.downloadMaterial(material.id, material.originalFilename)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (err) {
      showToast(err.message || 'Could not download the file.', 'error')
    } finally {
      setDownloadingId(null)
    }
  }

  const visibleMaterials = materials.filter(item => {
    if (courseFilter !== 'ALL' && item.courseCode !== courseFilter) return false
    if (kindFilter !== 'ALL' && item.kind !== kindFilter) return false
    return true
  })

  return {
    canManage,
    materials: visibleMaterials,
    loading,
    error,
    courseFilter,
    setCourseFilter,
    kindFilter,
    setKindFilter,
    showUploadForm,
    setShowUploadForm,
    createForm,
    createFile,
    creating,
    deletingId,
    downloadingId,
    viewingId,
    preview,
    toast,
    courseOptions,
    kindOptions: KIND_OPTIONS,
    handleFormChange,
    handleFileSelect,
    handleCreate,
    handleDelete,
    handleDownload,
    handleView,
    closePreview,
  }
}

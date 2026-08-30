import { useState, useEffect, useCallback } from 'react'
import { adminAdvisingService } from '../services/adminAdvisingService.js'

/**
 * useAdminAdvisorController – Custom hook managing the Assign Advisor admin page.
 *
 * MVC Role: Controller
 */
export function useAdminAdvisorController() {
  const [facultyList, setFacultyList] = useState([])
  const [search,      setSearch]      = useState('')
  const [loading,     setLoading]     = useState(true)
  const [togglingId,  setTogglingId]  = useState(null)
  const [toast,       setToast]       = useState(null)
  const [toastType,   setToastType]   = useState('success')

  const showToast = (msg, type = 'success') => {
    setToast(msg)
    setToastType(type)
    setTimeout(() => setToast(null), 3500)
  }

  const loadFaculty = useCallback(async () => {
    setLoading(true)
    try {
      const list = await adminAdvisingService.getFacultyAdvisors()
      setFacultyList(list)
    } catch (err) {
      showToast(err.message || 'Error loading faculty list', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFaculty()
  }, [loadFaculty])

  const handleToggleAdvisor = async (userId, currentStatus) => {
    setTogglingId(userId)
    try {
      const res = await adminAdvisingService.toggleAdvisor(userId, !currentStatus)
      setFacultyList(prev => prev.map(f => f.userId === userId ? { ...f, isAdvisor: res.isAdvisor } : f))
      showToast(res.message, 'success')
    } catch (err) {
      showToast(err.message || 'Could not update advisor role', 'error')
    } finally {
      setTogglingId(null)
    }
  }

  const filteredFaculty = facultyList.filter(f => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return (
      (f.name && f.name.toLowerCase().includes(q)) ||
      (f.userId && f.userId.toLowerCase().includes(q)) ||
      (f.email && f.email.toLowerCase().includes(q)) ||
      (f.department && f.department.toLowerCase().includes(q))
    )
  })

  const advisorCount = facultyList.filter(f => f.isAdvisor).length

  return {
    facultyList: filteredFaculty,
    totalFaculty: facultyList.length,
    advisorCount,
    search,
    setSearch,
    loading,
    togglingId,
    toast,
    toastType,
    handleToggleAdvisor,
    refreshFaculty: loadFaculty,
  }
}

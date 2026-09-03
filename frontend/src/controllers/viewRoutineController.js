/**
 * viewRoutineController.js – Controller hook for Student "View Routine" page.
 *
 * MVC Role: Controller
 * Fetches the student's active advised/registered courses and generates routine matrix and exam schedules.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getStoredUser } from '../models/authModel.js'
import {
  DAYS_OF_WEEK,
  STANDARD_TIME_SLOTS,
  buildRoutineMatrix,
  generateExamSchedule,
  orderDaysFrom,
} from '../models/viewRoutineModel.js'
import apiClient from '../services/apiClient.js'
import { loadPreferences, PREFERENCE_CHANGE_EVENT, getPreferredSemester, toSemesterApiTerm } from '../models/accountSettingsModel.js'

export function useViewRoutineController() {
  const [courses, setCourses]           = useState([])
  const [studentProfile, setStudentProfile] = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [weekStartsOn, setWeekStartsOn] = useState(
    () => loadPreferences().calendar.weekStartsOn
  )

  const user = getStoredUser()
  const studentId = user?.userId || 'STU001'
  const preferredSemester = getPreferredSemester()
  const preferredTerm = toSemesterApiTerm(preferredSemester)

  const loadRoutineData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Query both registration/my and advisors/student to ensure complete aggregation
      const [regRes, advRes] = await Promise.all([
        apiClient.get(`/api/registration/my?studentId=${studentId}&term=${encodeURIComponent(preferredTerm)}`).catch(() => ({ ok: false })),
        apiClient.get(`/api/advisors/student/${studentId}?term=${encodeURIComponent(preferredTerm)}`).catch(() => ({ ok: false }))
      ])

      let advisedList = []
      let profData = null

      if (advRes.ok) {
        const advData = await advRes.json()
        profData = advData
        advisedList = advData.advisedCourses || []
      }

      if (regRes.ok) {
        const regList = await regRes.json()
        if (advisedList.length === 0) {
          advisedList = regList
        }
      }

      setCourses(advisedList)
      setStudentProfile(profData || {
        studentName: user?.fullName || 'Student',
        studentId: studentId,
        department: 'Computer Science and Engineering',
        program: 'CS'
      })
    } catch {
      setError('Could not load routine. Please ensure backend is active.')
    } finally {
      setLoading(false)
    }
  }, [studentId, user?.fullName, preferredTerm])

  useEffect(() => {
    loadRoutineData()
  }, [loadRoutineData])

  useEffect(() => {
    const syncWeekStart = event => {
      const preferences = event?.detail || loadPreferences()
      setWeekStartsOn(preferences.calendar.weekStartsOn)
    }
    window.addEventListener(PREFERENCE_CHANGE_EVENT, syncWeekStart)
    window.addEventListener('storage', syncWeekStart)
    return () => {
      window.removeEventListener(PREFERENCE_CHANGE_EVENT, syncWeekStart)
      window.removeEventListener('storage', syncWeekStart)
    }
  }, [])

  // Build 2D routine matrix
  const matrix = useMemo(() => {
    return buildRoutineMatrix(courses)
  }, [courses])

  // Build exam schedule
  const examSchedule = useMemo(() => {
    return generateExamSchedule(courses)
  }, [courses])

  const orderedDays = useMemo(() => orderDaysFrom(weekStartsOn), [weekStartsOn])

  // Determine all distinct time slots present in the routine (or standard slots)
  const activeTimeSlots = useMemo(() => {
    const customSlots = new Set()
    DAYS_OF_WEEK.forEach(day => {
      Object.keys(matrix[day] || {}).forEach(slot => {
        if (slot) customSlots.add(slot)
      })
    })

    // Combine standard slots with any dynamic custom slots, keeping standard order
    const ordered = [...STANDARD_TIME_SLOTS]
    customSlots.forEach(s => {
      if (!ordered.includes(s)) {
        ordered.push(s)
      }
    })
    return ordered
  }, [matrix])

  const handlePrint = () => {
    window.print()
  }

  return {
    studentProfile,
    courses,
    matrix,
    examSchedule,
    days: orderedDays,
    timeSlots: activeTimeSlots,
    loading,
    error,
    preferredSemester,
    handlePrint,
    refetch: loadRoutineData
  }
}

/**
 * examScheduleController.js – Controller layer for the Exam Schedule feature.
 *
 * MVC Role: Controller
 * Custom React hook that manages state and API fetch logic for the
 * Exam Schedule widget displayed on the student dashboard.
 *
 * No JSX, no CSS. Returns state and data to the View layer only.
 */

import { useState, useEffect } from 'react'
import {
  EXAM_SCHEDULE_API,
  FALLBACK_STUDENT_ID,
  EMPTY_EXAM_SCHEDULE,
} from '../models/examScheduleModel.js'

/**
 * useExamScheduleController
 *
 * Fetches exam schedule data for the logged-in student on mount.
 * Reads studentId from localStorage (key: "studentId"), falls back
 * to FALLBACK_STUDENT_ID ("STU001") for demo/unauthenticated sessions.
 *
 * Returns:
 *   examSchedule  – Array of ExamScheduleDTO objects from the backend
 *   loading       – true while the API call is in flight
 *   error         – error message string, or null on success
 *   studentId     – the resolved student ID used for the fetch
 */
export function useExamScheduleController() {
  const [examSchedule, setExamSchedule] = useState(EMPTY_EXAM_SCHEDULE)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState(null)

  // Resolve studentId – prefer localStorage, fall back to demo ID
  const studentId =
    (typeof localStorage !== 'undefined' && localStorage.getItem('studentId')) ||
    FALLBACK_STUDENT_ID

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(`${EXAM_SCHEDULE_API}?studentId=${encodeURIComponent(studentId)}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(data => {
        if (!cancelled) {
          setExamSchedule(Array.isArray(data) ? data : EMPTY_EXAM_SCHEDULE)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!cancelled) {
          console.error('[ExamScheduleController] Fetch failed:', err)
          setError('Could not load exam schedule. Is the backend running?')
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [studentId])

  return { examSchedule, loading, error, studentId }
}

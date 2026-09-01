/**
 * gpaController.js – Controller hook for Grade Tracking & GPA Calculation.
 *
 * MVC Role: Controller
 *
 * Manages all state, API fetching, and handlers for GpaView.
 * No JSX or styling — returns state + actions only.
 *
 * Tabs:
 *   'transcript' → read-only transcript view
 *   'predict'    → predictive CGPA calculator
 *   'retake'     → retake / grade improvement simulator
 */

import { useState, useEffect, useCallback } from 'react'
import {
  GRADE_OPTIONS,
  INITIAL_PREDICT_ROW,
  INITIAL_RETAKE_FORM,
  computeGpa,
  computePredictedCgpa,
  computeRetakeCgpa,
  getAcademicStanding,
  getGradePoint,
} from '../models/gpaModel.js'
import { gpaService } from '../services/gpaService.js'

export function useGpaController() {
  // ── Tab ────────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('transcript')

  // ── Transcript state ───────────────────────────────────────────────────────
  const [transcript, setTranscript]         = useState(null)  // full server response
  const [transcriptLoading, setTranscriptLoading] = useState(true)
  const [transcriptError, setTranscriptError]     = useState(null)

  // ── Predict state ──────────────────────────────────────────────────────────
  const [predictRows, setPredictRows]             = useState([{ ...INITIAL_PREDICT_ROW }])
  const [predictResult, setPredictResult]         = useState(null)  // server or local result
  const [currentCoursesLoading, setCurrentCoursesLoading] = useState(false)

  // ── Retake state ───────────────────────────────────────────────────────────
  const [retakeForm, setRetakeForm]   = useState({ ...INITIAL_RETAKE_FORM })
  const [retakeResult, setRetakeResult] = useState(null)

  // ── Toast ──────────────────────────────────────────────────────────────────
  const [toast, setToast]         = useState(null)
  const [toastType, setToastType] = useState('success')

  const showToast = useCallback((msg, type = 'success') => {
    setToast(msg)
    setToastType(type)
    setTimeout(() => setToast(null), 4000)
  }, [])

  // ── 1. Load transcript on mount ────────────────────────────────────────────
  const loadTranscript = useCallback(async () => {
    setTranscriptLoading(true)
    setTranscriptError(null)
    try {
      const data = await gpaService.getTranscript()
      if (data.success) {
        setTranscript(data)
      } else {
        setTranscriptError(data.message || 'Failed to load transcript.')
      }
    } catch (err) {
      setTranscriptError('Network error loading transcript: ' + err.message)
    } finally {
      setTranscriptLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTranscript()
  }, [loadTranscript])

  // ── 2. When predict tab opens for the first time, load current courses ─────
  const loadCurrentCourses = useCallback(async () => {
    setCurrentCoursesLoading(true)
    try {
      const data = await gpaService.getCurrentCourses()
      if (data.success && data.courses && data.courses.length > 0) {
        // Pre-populate predict rows from advised courses
        const rows = data.courses.map(c => ({
          courseCode:     c.courseCode || '',
          courseName:     c.courseName || c.courseTitle || '',
          credits:        Number(c.credits) || 3,
          predictedGrade: '',
        }))
        setPredictRows(rows)
      }
      // If no courses → keep the default empty row (student can add manually)
    } catch {
      // Silently fail — student can still enter manually
    } finally {
      setCurrentCoursesLoading(false)
    }
  }, [])

  // Track whether we've already loaded courses so we only fetch once
  const [coursesLoaded, setCoursesLoaded] = useState(false)

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab)
    if (tab === 'predict' && !coursesLoaded) {
      setCoursesLoaded(true)
      loadCurrentCourses()
    }
  }, [coursesLoaded, loadCurrentCourses])

  // ── 3. Predict tab handlers ────────────────────────────────────────────────

  /** Update a field in a specific predict row */
  const handlePredictRowChange = useCallback((index, field, value) => {
    setPredictRows(prev => {
      const next = prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
      return next
    })
    // Live recalculate whenever a grade changes
    setPredictResult(null)  // clear old result so recalc runs via effect
  }, [])

  /** Add a blank row to the predict table */
  const handleAddPredictRow = useCallback(() => {
    setPredictRows(prev => [...prev, { ...INITIAL_PREDICT_ROW }])
  }, [])

  /** Remove a predict row */
  const handleRemovePredictRow = useCallback((index) => {
    setPredictRows(prev => prev.filter((_, i) => i !== index))
  }, [])

  /**
   * Run the prediction:
   *  - Tries the backend first (authoritative existing QP)
   *  - Falls back to pure client-side math if backend unavailable
   */
  const handlePredict = useCallback(async () => {
    const validRows = predictRows.filter(r => r.credits > 0 && r.predictedGrade)
    if (validRows.length === 0) {
      showToast('Please enter at least one course with a predicted grade.', 'error')
      return
    }

    try {
      const payload = {
        courses: predictRows.map(r => ({
          courseCode:     r.courseCode,
          courseName:     r.courseName,
          credits:        Number(r.credits),
          predictedGrade: r.predictedGrade,
        }))
      }
      const data = await gpaService.predictCgpa(payload)
      if (data.success) {
        setPredictResult(data)
      } else {
        // Fall back to client-side math
        _runClientSidePredict()
      }
    } catch {
      _runClientSidePredict()
    }
  }, [predictRows, transcript, showToast])

  /** Client-side fallback prediction using existing transcript data */
  const _runClientSidePredict = useCallback(() => {
    // Accumulate existing grade points and course count from transcript
    let existingGradePoints = 0
    let existingCourseCount = 0
    if (transcript?.semesters) {
      for (const sem of transcript.semesters) {
        for (const course of sem.courses || []) {
          if (course.countsForGpa && course.gradePoint != null) {
            existingGradePoints += course.gradePoint
            existingCourseCount++
          }
        }
      }
    }
    const { predictedSemGpa, predictedCgpa, semCourseCount } = computePredictedCgpa(
      existingGradePoints, existingCourseCount, predictRows
    )
    const breakdown = predictRows
      .filter(r => r.predictedGrade)
      .map(r => {
        const gp = getGradePoint(r.predictedGrade)
        return {
          courseCode:     r.courseCode,
          courseName:     r.courseName,
          credits:        r.credits,
          predictedGrade: r.predictedGrade,
          gradePoint:     gp,
          countsForGpa:   gp != null,
        }
      })
    const existingCgpa = existingCourseCount > 0
      ? Math.round((existingGradePoints / existingCourseCount) * 100) / 100
      : 0
    setPredictResult({
      success:              true,
      existingCgpa,
      predictedSemGpa,
      predictedCgpa,
      totalPredictedCourses: semCourseCount,
      breakdown,
      simulated:            true,
    })
  }, [predictRows, transcript])

  // ── 4. Retake tab handlers ─────────────────────────────────────────────────

  const handleRetakeFieldChange = useCallback((field, value) => {
    setRetakeForm(prev => ({ ...prev, [field]: value }))
    setRetakeResult(null)  // clear old result on change
  }, [])

  /**
   * Run the retake simulation:
   *  - Tries backend first
   *  - Falls back to client-side math using transcript courses
   */
  const handleSimulateRetake = useCallback(async () => {
    if (!retakeForm.courseCode || !retakeForm.newGrade) {
      showToast('Please select a course and a new grade to simulate.', 'error')
      return
    }

    try {
      const data = await gpaService.simulateRetake({
        courseCode: retakeForm.courseCode,
        newGrade:   retakeForm.newGrade,
      })
      if (data.success) {
        setRetakeResult(data)
      } else {
        showToast(data.message || 'Simulation failed.', 'error')
      }
    } catch {
      // Client-side fallback
      _runClientSideRetake()
    }
  }, [retakeForm, transcript, showToast])

  const _runClientSideRetake = useCallback(() => {
    if (!transcript?.semesters) {
      showToast('No transcript data available for simulation.', 'error')
      return
    }
    // Flatten all completed courses from transcript
    const allCourses = []
    for (const sem of transcript.semesters) {
      for (const c of sem.courses || []) {
        allCourses.push(c)
      }
    }
    const target = allCourses.find(
      c => c.courseCode === retakeForm.courseCode
    )
    if (!target) {
      showToast(`Course ${retakeForm.courseCode} not found in transcript.`, 'error')
      return
    }
    const { beforeCgpa, afterCgpa, cgpaChange } = computeRetakeCgpa(
      allCourses, retakeForm.courseCode, retakeForm.newGrade
    )
    setRetakeResult({
      success:       true,
      courseCode:    target.courseCode,
      courseTitle:   target.courseTitle,
      credits:       target.credits,
      oldGrade:      target.grade,
      oldGradePoint: target.gradePoint,
      newGrade:      retakeForm.newGrade,
      newGradePoint: getGradePoint(retakeForm.newGrade),
      beforeCgpa,
      afterCgpa,
      cgpaChange,
      improved:      cgpaChange > 0,
      simulated:     true,
      retakePolicy:  'GRADE_REPLACEMENT',
    })
  }, [retakeForm, transcript, showToast])

  // ── Derived values ─────────────────────────────────────────────────────────

  // List of GPA-eligible completed courses for the retake dropdown
  const retakableCourses = (() => {
    if (!transcript?.semesters) return []
    const seen = new Set()
    const list = []
    for (const sem of transcript.semesters) {
      for (const c of sem.courses || []) {
        if (c.countsForGpa && !seen.has(c.courseCode)) {
          seen.add(c.courseCode)
          list.push({ courseCode: c.courseCode, courseTitle: c.courseTitle, grade: c.grade })
        }
      }
    }
    return list
  })()

  const standing = getAcademicStanding(transcript?.currentCgpa ?? 0)
  const hasTranscript = transcript?.semesters?.length > 0

  return {
    // Tab
    activeTab,
    handleTabChange,

    // Transcript
    transcript,
    transcriptLoading,
    transcriptError,
    hasTranscript,
    standing,

    // Predict
    predictRows,
    predictResult,
    currentCoursesLoading,
    handlePredictRowChange,
    handleAddPredictRow,
    handleRemovePredictRow,
    handlePredict,

    // Retake
    retakeForm,
    retakeResult,
    retakableCourses,
    handleRetakeFieldChange,
    handleSimulateRetake,

    // Toast
    toast,
    toastType,

    // Constants
    GRADE_OPTIONS,
  }
}

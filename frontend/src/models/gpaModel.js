/**
 * gpaModel.js – Model layer for Grade Tracking and GPA Calculation.
 *
 * MVC Role: Model
 *
 * Contains:
 *  - Grading scale constants (mirrors backend BypassCourseService.getGradePoint)
 *  - Pure GPA math functions (no React, no state, no side effects)
 *  - Initial state shapes for predict and retake forms
 *  - Academic standing helper
 *
 * Used by: gpaController.js, GpaView.jsx
 */

// ── Grading Scale (4.0 scale, BRACU) ─────────────────────────────────────────
// Mirrors BypassCourseService.getGradePoint() on the backend — single source of truth.

export const GRADE_OPTIONS = [
  { grade: 'A+',  point: 4.0,  label: 'A+  (4.00)' },
  { grade: 'A',   point: 4.0,  label: 'A   (4.00)' },
  { grade: 'A-',  point: 3.7,  label: 'A-  (3.70)' },
  { grade: 'B+',  point: 3.3,  label: 'B+  (3.30)' },
  { grade: 'B',   point: 3.0,  label: 'B   (3.00)' },
  { grade: 'B-',  point: 2.7,  label: 'B-  (2.70)' },
  { grade: 'C+',  point: 2.3,  label: 'C+  (2.30)' },
  { grade: 'C',   point: 2.0,  label: 'C   (2.00)' },
  { grade: 'D',   point: 1.0,  label: 'D   (1.00)' },
  { grade: 'F',   point: 0.0,  label: 'F   (0.00)' },
]

/**
 * Returns the grade point for a letter grade, or null for non-GPA grades (WAIVED, P).
 * @param {string} grade
 * @returns {number|null}
 */
export function getGradePoint(grade) {
  if (!grade) return null
  const g = grade.trim().toUpperCase()
  switch (g) {
    case 'A+': case 'A': return 4.0
    case 'A-':           return 3.7
    case 'B+':           return 3.3
    case 'B':            return 3.0
    case 'B-':           return 2.7
    case 'C+':           return 2.3
    case 'C':            return 2.0
    case 'D':            return 1.0
    case 'F':            return 0.0
    default:             return null  // WAIVED, P — non-GPA
  }
}

// ── GPA Math (pure functions) ─────────────────────────────────────────────────

/**
 * Computes GPA from a list of courses.
 * Formula: Σ(gradePoint) / number of GPA-eligible courses
 * Courses with null gradePoint (WAIVED, P, blank) are excluded.
 *
 * @param {Array<{grade: string}>} courses
 * @returns {number} Rounded to 2 decimal places. 0.0 if no graded courses.
 */
export function computeGpa(courses) {
  let totalGradePoints = 0
  let courseCount = 0

  for (const c of courses) {
    if (!c) continue
    const gp = getGradePoint(c.grade)
    if (gp === null) continue  // WAIVED / P / blank → excluded
    totalGradePoints += gp
    courseCount++
  }

  if (courseCount === 0) return 0.0
  return Math.round((totalGradePoints / courseCount) * 100) / 100
}

/**
 * Computes the predicted overall CGPA by combining the student's existing
 * completed courses with predicted grades for new courses.
 *
 * Formula: Σ(gradePoint) / number of GPA-eligible courses
 *
 * @param {number} existingGradePoints - Sum of gradePoints for all completed courses
 * @param {number} existingCourseCount - Number of completed GPA-eligible courses
 * @param {Array<{predictedGrade: string}>} predictedCourses
 * @returns {{ predictedSemGpa: number, predictedCgpa: number, semCourseCount: number }}
 */
export function computePredictedCgpa(existingGradePoints, existingCourseCount, predictedCourses) {
  let semGradePoints = 0
  let semCourseCount = 0

  for (const c of predictedCourses) {
    if (!c) continue
    const gp = getGradePoint(c.predictedGrade)
    if (gp === null) continue
    semGradePoints += gp
    semCourseCount++
  }

  const predictedSemGpa = semCourseCount > 0
    ? Math.round((semGradePoints / semCourseCount) * 100) / 100
    : 0.0

  const combinedGradePoints = existingGradePoints + semGradePoints
  const combinedCourseCount = existingCourseCount + semCourseCount

  const predictedCgpa = combinedCourseCount > 0
    ? Math.round((combinedGradePoints / combinedCourseCount) * 100) / 100
    : 0.0

  return { predictedSemGpa, predictedCgpa, semCourseCount }
}

/**
 * Simulates the CGPA after retaking a course with a new grade (grade replacement policy).
 *
 * Formula: Σ(gradePoint) / courseCount  — same as backend
 *
 * @param {Array<{courseCode: string, grade: string, gradePoint: number|null}>} allCourses
 * @param {string} retakeCourseCode - Course code of the course being retaken
 * @param {string} newGrade         - Hypothetical new letter grade
 * @returns {{ beforeCgpa: number, afterCgpa: number, cgpaChange: number }}
 */
export function computeRetakeCgpa(allCourses, retakeCourseCode, newGrade) {
  let beforeGradePoints = 0
  let beforeCourseCount = 0
  let oldGp = null

  for (const c of allCourses) {
    const gp = c.gradePoint != null ? c.gradePoint : getGradePoint(c.grade)
    if (gp === null) continue
    if (c.grade === 'WAIVED' || c.grade === 'P') continue
    beforeGradePoints += gp
    beforeCourseCount++
    if (c.courseCode === retakeCourseCode) {
      oldGp = gp
    }
  }

  const beforeCgpa = beforeCourseCount > 0
    ? Math.round((beforeGradePoints / beforeCourseCount) * 100) / 100
    : 0.0

  const newGp = getGradePoint(newGrade) ?? 0.0  // F → 0.0
  if (getGradePoint(newGrade) === null && newGrade?.toUpperCase() !== 'F') {
    return { beforeCgpa, afterCgpa: beforeCgpa, cgpaChange: 0 }
  }

  // Grade replacement: remove old contribution, add new
  let afterGradePoints = beforeGradePoints
  let afterCourseCount = beforeCourseCount

  if (oldGp !== null) {
    afterGradePoints -= oldGp
    afterCourseCount--
  }
  afterGradePoints += newGp
  afterCourseCount++

  const afterCgpa = afterCourseCount > 0
    ? Math.round((afterGradePoints / afterCourseCount) * 100) / 100
    : 0.0

  const cgpaChange = Math.round((afterCgpa - beforeCgpa) * 100) / 100

  return { beforeCgpa, afterCgpa, cgpaChange }
}

// ── Academic Standing ─────────────────────────────────────────────────────────

/**
 * Returns the academic standing label and color based on CGPA.
 * @param {number} cgpa
 * @returns {{ label: string, color: string, bg: string }}
 */
export function getAcademicStanding(cgpa = 0) {
  const val = parseFloat(cgpa) || 0
  if (val >= 3.75) return { label: "Dean's List 🌟",      color: '#059669', bg: '#D1FAE5' }
  if (val >= 3.50) return { label: 'High Standing 🟢',    color: '#10B981', bg: '#ECFDF5' }
  if (val >= 2.00) return { label: 'Good Standing 🔵',    color: '#2563EB', bg: '#EFF6FF' }
  if (val  >  0)   return { label: 'Academic Probation 🔴', color: '#DC2626', bg: '#FEE2E2' }
  return { label: 'No Records', color: '#6B7280', bg: '#F3F4F6' }
}

// ── Initial State Shapes ──────────────────────────────────────────────────────

/** Initial state for a single predict-row (used in predict form) */
export const INITIAL_PREDICT_ROW = {
  courseCode:     '',
  courseName:     '',
  credits:        3,
  predictedGrade: '',
}

/** Initial state for the retake simulator form */
export const INITIAL_RETAKE_FORM = {
  courseCode: '',
  newGrade:   '',
}

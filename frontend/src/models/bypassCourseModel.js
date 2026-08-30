/**
 * bypassCourseModel.js – Model definitions for Course Bypass & CGPA Tracking.
 *
 * MVC Role: Model
 * Pure JS definitions for grades, credit scales, bypass reasons, and schema shapes.
 */

export const GRADE_OPTIONS = [
  { grade: 'A+',   point: 4.0, label: 'A+ (4.00 - Outstanding)' },
  { grade: 'A',    point: 4.0, label: 'A (4.00 - Excellent)' },
  { grade: 'A-',   point: 3.7, label: 'A- (3.70 - Very Good)' },
  { grade: 'B+',   point: 3.3, label: 'B+ (3.30 - Good)' },
  { grade: 'B',    point: 3.0, label: 'B (3.00 - Satisfactory)' },
  { grade: 'B-',   point: 2.7, label: 'B- (2.70 - Above Average)' },
  { grade: 'C+',   point: 2.3, label: 'C+ (2.30 - Average)' },
  { grade: 'C',    point: 2.0, label: 'C (2.00 - Pass)' },
  { grade: 'D',    point: 1.0, label: 'D (1.00 - Poor Pass)' },
  { grade: 'WAIVED', point: null, label: 'WAIVED (Credit Granted, No GPA Impact)' },
]

export const BYPASS_REASONS = [
  'Credit Transfer from External Institution',
  'Dean / Department Head Special Approval',
  'Prerequisite Course Exemption',
  'Prior Learning / Professional Recognition',
  'Institutional Course Waiver',
  'Curriculum Migration Equivalence',
]

export const INITIAL_BYPASS_FORM = {
  studentId: '',
  courseCode: '',
  courseTitle: '',
  credits: 3,
  grade: 'A',
  reason: 'Credit Transfer from External Institution',
  semester: 'Transferred / Bypassed',
}

/**
 * Returns academic standing configuration based on CGPA.
 */
export function getAcademicStanding(cgpa = 0) {
  const val = parseFloat(cgpa) || 0
  if (val >= 3.75) {
    return { label: "Dean's Honor List 🌟", color: '#059669', bg: '#D1FAE5' }
  }
  if (val >= 3.50) {
    return { label: 'High Standing 🟢', color: '#10B981', bg: '#ECFDF5' }
  }
  if (val >= 2.00) {
    return { label: 'Good Standing 🟡', color: '#2563EB', bg: '#EFF6FF' }
  }
  return { label: 'Academic Probation 🔴', color: '#DC2626', bg: '#FEE2E2' }
}

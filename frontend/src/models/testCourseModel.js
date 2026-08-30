/**
 * testCourseModel.js – Model layer for Test Courses, Sections, and Faculty.
 *
 * MVC Role: Model
 * Pure JavaScript module. Defines schemas, constants, and helpers.
 */

export const TEST_DEPARTMENTS = [
  'All Departments',
  'Computer Science and Engineering',
  'Electrical and Electronic Engineering',
  'Mathematics and Natural Sciences',
  'BRAC Business School',
  'Economics and Social Sciences',
  'English and Humanities',
  'Pharmacy'
]

export const TEST_COURSE_LEVELS = ['UNDERGRADUATE', 'GRADUATE']

export const DEFAULT_TERM = 'Summer2026'

/**
 * Validates whether a test course object has required fields.
 * @param {Object} course
 * @returns {boolean}
 */
export function isValidTestCourse(course) {
  return Boolean(course && course.code && course.name && course.credits)
}

/**
 * Formats faculty display title with designation and department.
 * @param {Object} faculty
 * @returns {string}
 */
export function formatFacultyHeadline(faculty) {
  if (!faculty) return 'Unassigned'
  return `${faculty.name} (${faculty.designation}, ${faculty.department})`
}

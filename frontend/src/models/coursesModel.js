/**
 * coursesModel.js – Model layer for the Courses Catalog page.
 *
 * MVC Role: Model
 *
 * Contains:
 *  - FACULTIES  – static BRACU department list used for filter tabs
 *  - YEARS      – filter options
 *  - SEMESTERS  – filter options
 *
 * NOTE: COURSES data is now loaded from the Neon database via
 *   GET /api/courses/catalog (see courseService.js + coursesController.js).
 *   The old static COURSES array has been removed.
 */

export const FACULTIES = [
  { id: 'cse',  label: 'Computer Science & Engineering', icon: '💻', color: '#E8F4FD', accent: '#2563EB' },
  { id: 'eee',  label: 'Electrical & Electronic Eng.',   icon: '⚡', color: '#FFF7ED', accent: '#EA580C' },
  { id: 'bba',  label: 'Business Administration (BBA)',  icon: '📊', color: '#F0FDF4', accent: '#16A34A' },
  { id: 'math', label: 'Mathematics & Physics',          icon: '📐', color: '#F0F9FF', accent: '#0284C7' },
  { id: 'eng',  label: 'English & Communication',        icon: '📝', color: '#FFF8F0', accent: '#B45309' },
]

export const YEARS     = ['All Years', 'Year 1', 'Year 2', 'Year 3', 'Year 4']
export const SEMESTERS = ['All Semesters', 'Fall', 'Spring', 'Summer']

/**
 * dashboardModel.js – Model layer for the Dashboard page.
 *
 * MVC Role: Model
 * Contains static placeholder data for the dashboard.
 *
 * TODO (Phase 2): Replace with live data from:
 *   GET /api/courses/in-progress  → CONTINUE_LEARNING
 *   GET /api/courses/enrolled     → stat: enrolled count
 *   GET /api/schedule/weekly      → stat: classes/week
 *   GET /api/attendance/summary   → stat: attendance %
 */

export const CONTINUE_LEARNING = [
  {
    id: 1,
    icon: '📐',
    iconBg: '#E8F4FD',
    name: 'Engineering Mathematics',
    meta: 'Year 2 · 3 Credits',
    progress: 65,
    status: 'In Progress',
  },
  {
    id: 2,
    icon: '💻',
    iconBg: '#F0FDF4',
    name: 'Data Structures & Algorithms',
    meta: 'Year 2 · 3 Credits',
    progress: 40,
    status: 'In Progress',
  },
  {
    id: 3,
    icon: '🔬',
    iconBg: '#FFF7ED',
    name: 'Physics for Engineers',
    meta: 'Year 1 · 4 Credits',
    progress: 100,
    status: 'Completed',
  },
]

export const DASHBOARD_STATS = [
  { icon: '🎓', iconColor: 'teal',   value: '6',   label: 'Enrolled Courses',           linkText: 'View details',  isActive: true },
  { icon: '📅', iconColor: 'purple', value: '18',  label: 'Classes This Week (Routine)', linkText: 'View schedule', isActive: false },
  { icon: '✅', iconColor: 'orange', value: '87%', label: 'Attendance Metrics',          linkText: 'View report',   isActive: false },
]

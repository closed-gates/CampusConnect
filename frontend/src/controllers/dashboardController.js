/**
 * dashboardController.js – Controller layer for the Dashboard page.
 *
 * MVC Role: Controller
 * Provides derived state and computed values for DashboardView.
 */

import { CONTINUE_LEARNING, DASHBOARD_STATS } from '../models/dashboardModel.js'

/**
 * useDashboardController
 * Returns all data the DashboardView needs to render.
 *
 * TODO (Phase 2): Replace static data with API calls:
 *   GET /api/courses/in-progress  → continueLearning
 *   GET /api/courses/enrolled     → stats[0].value
 *   GET /api/schedule/weekly      → stats[1].value
 *   GET /api/attendance/summary   → stats[2].value
 *   GET /api/user/me              → greeting name
 */
export function useDashboardController() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return {
    today,
    continueLearning: CONTINUE_LEARNING,
    stats: DASHBOARD_STATS,
  }
}

/**
 * ProtectedRoute.jsx – Route guard component.
 *
 * MVC Role: View (shared component)
 *
 * Redirects unauthenticated users to the login page.
 * Wraps all protected routes in App.jsx.
 *
 * Uses isTokenValid() from authModel to check if:
 *   - A JWT token exists in localStorage
 *   - The token has not expired (client-side expiry check)
 *
 * Note: Server-side token validation happens automatically on every
 * API call (the backend returns 401 if the token is invalid/expired).
 * On 401, individual feature controllers should call clearAuth() + navigate('/').
 */

import { Navigate, Outlet } from 'react-router-dom'
import { isTokenValid } from '../../models/authModel.js'

/**
 * ProtectedRoute
 *
 * Usage in App.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<DashboardView />} />
 *     ...
 *   </Route>
 */
export default function ProtectedRoute() {
  if (!isTokenValid()) {
    // Not authenticated → redirect to login, replace history entry
    // so the back button doesn't send them back to a protected page
    return <Navigate to="/" replace />
  }

  // Authenticated → render child routes
  return <Outlet />
}

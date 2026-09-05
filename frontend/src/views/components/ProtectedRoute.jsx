/**
 * ProtectedRoute.jsx – Route guard component.
 *
 * MVC Role: View (shared component)
 *
 * Redirects unauthenticated users to the login page.
 * Wraps all protected routes in App.jsx.
 *
 * Also mounts the account-freeze WebSocket watcher so that if an admin
 * freezes this user while they are actively browsing, a full-screen
 * dialog appears immediately and the session is terminated.
 */

import { Navigate, Outlet } from 'react-router-dom'
import { isTokenValid } from '../../models/authModel.js'
import ChatbotWidget from './ChatbotWidget.jsx'
import FrozenAccountDialog from './FrozenAccountDialog.jsx'
import { useFreezeWatcher } from '../../controllers/useFreezeWatcher.js'

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

  // Authenticated → render child routes + floating AI assistant + freeze watcher
  return <AuthenticatedShell />
}

/** Inner shell — rendered only when authenticated, so hooks run unconditionally. */
function AuthenticatedShell() {
  const { freezeMessage, handleFreezeAcknowledge } = useFreezeWatcher()

  return (
    <>
      <Outlet />
      <ChatbotWidget />
      {/* Full-screen freeze dialog — shown immediately when admin freezes this account */}
      <FrozenAccountDialog
        message={freezeMessage}
        onClose={handleFreezeAcknowledge}
      />
    </>
  )
}

import Sidebar from '../components/Sidebar.jsx'
import DirectMessagingView from '../components/DirectMessaging/DirectMessagingView.jsx'

/**
 * MessagingView – View layer for the Messaging page.
 *
 * MVC Role: View
 * Wraps the Direct Messaging feature inside the dashboard shell.
 */
export default function MessagingView() {
  return (
    <div className="dashboard-wrapper">
      {/* CampusConnect shared sidebar */}
      <Sidebar activeItem="messaging" />

      {/* DM feature fills the remaining space */}
      <main
        style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        aria-label="Messaging Board"
      >
        <DirectMessagingView />
      </main>
    </div>
  )
}

import Sidebar from '../components/Sidebar'
import DirectMessagingContainer from '../components/DirectMessaging/DirectMessagingContainer'

/**
 * MessagingPage
 *
 * Wraps the Direct Messaging feature inside the standard
 * CampusConnect dashboard shell (sidebar + main area).
 * Zero changes to existing CampusConnect components.
 */
export default function MessagingPage() {
  return (
    <div className="dashboard-wrapper">
      {/* CampusConnect shared sidebar */}
      <Sidebar activeItem="messaging" />

      {/* DM feature fills the remaining space */}
      <main
        style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        aria-label="Messaging Board"
      >
        <DirectMessagingContainer />
      </main>
    </div>
  )
}

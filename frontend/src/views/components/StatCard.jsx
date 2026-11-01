/**
 * StatCard – View layer component for displaying a metric stat.
 *
 * MVC Role: View (shared component)
 *
 * Props:
 *   icon       {node}    – emoji or icon element shown beside the value
 *   iconColor  {string}  – 'red' highlights a value that needs attention
 *   value      {string}  – main metric value
 *   label      {string}  – description below the value
 *   linkText   {string}  – optional "View details" link text
 *   onLinkClick {func}   – optional click handler for the link
 *   isActive   {bool}    – adds teal border to the card
 */
export default function StatCard({
  icon,
  iconColor = '',
  value,
  label,
  linkText,
  onLinkClick,
  isActive = false,
}) {
  return (
    <div className={`stat-card ${isActive ? 'active-card' : ''}`}>
      {icon && <div className={`stat-card-icon ${iconColor}`} aria-hidden="true">{icon}</div>}
      <div className="stat-card-body">
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-label">{label}</div>
        {linkText && (
          <button type="button" className="stat-card-link" onClick={onLinkClick}>
            {linkText} →
          </button>
        )}
      </div>
    </div>
  )
}

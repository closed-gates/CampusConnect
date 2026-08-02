/**
 * StatCard – View layer component for displaying a metric stat.
 *
 * MVC Role: View (shared component)
 *
 * Props:
 *   icon       {string}  – emoji or icon element
 *   iconColor  {string}  – CSS class: 'teal' | 'purple' | 'orange'
 *   value      {string}  – main metric value
 *   label      {string}  – description below the value
 *   linkText   {string}  – optional "View details" link text
 *   onLinkClick {func}   – optional click handler for the link
 *   isActive   {bool}    – adds teal border to the card
 */
export default function StatCard({
  icon,
  iconColor = 'teal',
  value,
  label,
  linkText,
  onLinkClick,
  isActive = false,
}) {
  return (
    <div className={`stat-card ${isActive ? 'active-card' : ''}`}>
      <div className={`stat-card-icon ${iconColor}`}>
        {icon}
      </div>
      <div className="stat-card-body">
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-label">{label}</div>
        {linkText && (
          <div
            className="stat-card-link"
            onClick={onLinkClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onLinkClick?.()}
          >
            {linkText} →
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * PresenceDot.jsx – View component for the presence status indicator.
 *
 * MVC Role: View (pure, no state or logic)
 *
 * Renders a small colored dot that can be placed on top of any avatar.
 * Uses existing color tokens from the design system:
 *   Online  → #10b981  (matches getPresenceColor in dmUtils.js)
 *   Offline → #94a3b8
 *
 * The dot has a subtle glow animation when online to feel "alive".
 *
 * Feature: Online/Offline Presence Indicators
 */
export default function PresenceDot({
  isOnline,
  size = 10,
  borderColor = '#0d1117',   // dark background default (CourseChannelView)
  borderColorLight = '#fff', // light background default (DMConversationList)
  useLightBorder = false,
  style = {},
}) {
  const color  = isOnline ? '#10b981' : '#6b7280'
  const border = useLightBorder ? borderColorLight : borderColor

  return (
    <span
      aria-label={isOnline ? 'Online' : 'Offline'}
      title={isOnline ? 'Online' : 'Offline'}
      style={{
        display:      'inline-block',
        width:        size,
        height:       size,
        borderRadius: '50%',
        background:   color,
        border:       `2px solid ${border}`,
        flexShrink:   0,
        boxShadow:    isOnline ? `0 0 6px ${color}88` : 'none',
        animation:    isOnline ? 'presencePulse 2.5s ease-in-out infinite' : 'none',
        ...style,
      }}
    />
  )
}

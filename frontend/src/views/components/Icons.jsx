/**
 * Icons – small outline SVG icons shared by views (16px, 1.5px stroke).
 *
 * MVC Role: View (shared component)
 */
const base = {
  width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
}

export function CheckIcon(props) {
  return <svg {...base} {...props}><path d="M20 6 9 17l-5-5" /></svg>
}

export function PaperclipIcon(props) {
  return <svg {...base} {...props}><path d="m21.4 11-8.8 8.8a5.5 5.5 0 0 1-7.8-7.8l8.8-8.8a3.7 3.7 0 0 1 5.2 5.2l-8.8 8.8a1.8 1.8 0 0 1-2.6-2.6l8.1-8.1" /></svg>
}

export function SmileIcon(props) {
  return <svg {...base} {...props}><circle cx="12" cy="12" r="9" /><path d="M8.5 14.5a4.5 4.5 0 0 0 7 0" /><path d="M9 9.5h.01M15 9.5h.01" /></svg>
}

export function SendIcon(props) {
  return <svg {...base} {...props}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
}

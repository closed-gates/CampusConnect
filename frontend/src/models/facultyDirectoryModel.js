/** Pure presentation helpers for database-backed faculty directory records. */

export const ALL_CATEGORIES = 'All categories'
export const ALL_THESIS_STATUSES = 'All thesis statuses'
export const THESIS_STATUS_OPTIONS = [ALL_THESIS_STATUSES, 'Accepting', 'Not Accepting', 'Not listed']

const CATEGORY_ORDER = [
  'Department Leadership', 'Professors', 'Associate Professors', 'Assistant Professors',
  'Senior Lecturers', 'Lecturers', 'Adjunct Lecturers', 'Research Assistants',
  'Department Coordination Officers', 'Lab Technical Officer',
]
const AVATAR_COLORS = ['#0f766e', '#1d4ed8', '#7c3aed', '#b45309', '#be185d', '#0369a1']

export function getInitials(name = '') {
  const ignored = new Set(['dr.', 'mr.', 'ms.', 'phd'])
  const parts = name.split(/\s+/).filter(part => part && !ignored.has(part.toLowerCase()))
  return parts.slice(0, 2).map(part => part[0]).join('').toUpperCase() || '?'
}

export function decorateDirectoryEntry(entry) {
  return { ...entry, initials: getInitials(entry.name), color: AVATAR_COLORS[Number(entry.id || 0) % AVATAR_COLORS.length] }
}

export function getCategoryOptions(entries) {
  const available = new Set(entries.map(entry => entry.category))
  return [ALL_CATEGORIES, ...CATEGORY_ORDER.filter(category => available.has(category))]
}

export function groupDirectoryByCategory(entries) {
  return CATEGORY_ORDER
    .map(category => ({ category, people: entries.filter(person => person.category === category) }))
    .filter(group => group.people.length > 0)
}

export function thesisStatusClass(status) {
  if (status === 'Accepting') return 'accepting'
  if (status === 'Not Accepting') return 'not-accepting'
  return 'not-listed'
}

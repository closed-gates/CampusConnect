/**
 * registrationModel.js – Model layer for the Course Registration feature.
 *
 * MVC Role: Model
 *
 * Contains:
 *  - CURRENT_TERM         – active registration term
 *  - ADVISING_TIERS       – credit thresholds that define priority windows
 *  - getStatusConfig()    – pure helper mapping seat counts to UI status
 *  - SORT_OPTIONS         – sort order choices for the section browser
 *  - EMPTY_REGISTRATION_STATE – initial controller state shape
 *
 * Rules: No JSX, no hooks, no side effects, no API calls.
 */

/** The term students are currently registering for */
export const CURRENT_TERM = 'Fall2026'

/** Maximum credits per section (universal across BRACU sections) */
export const CREDITS_PER_SECTION = 3

/**
 * Priority tiers by completed credits.
 * Students with higher completedCredits get their advising window first.
 */
export const ADVISING_TIERS = [
  {
    tier:       1,
    label:      'Priority 1 – Senior Students',
    creditsMin: 60,
    color:      '#10B981',
    bg:         '#ECFDF5',
    icon:       '🏆',
    description: 'Students with 60+ completed credits — window open now',
  },
  {
    tier:       2,
    label:      'Priority 2 – Mid-level Students',
    creditsMin: 30,
    color:      '#3B82F6',
    bg:         '#EFF6FF',
    icon:       '📅',
    description: 'Students with 30–59 completed credits — window open now',
  },
  {
    tier:       3,
    label:      'Priority 3 – First-year Students',
    creditsMin: 0,
    color:      '#F59E0B',
    bg:         '#FFFBEB',
    icon:       '⏳',
    description: 'Students with < 30 completed credits — window not yet open',
  },
]

/**
 * Returns UI configuration for a section's seat availability.
 * @param {number} seatsRemaining
 * @param {number} totalSeats
 * @returns {{ label, color, bg, pct, variant }}
 */
export function getStatusConfig(seatsRemaining, totalSeats) {
  if (!totalSeats || totalSeats === 0) return { label: 'N/A', color: '#6B7280', bg: '#F3F4F6', pct: 0, variant: 'full' }
  const pct = ((totalSeats - seatsRemaining) / totalSeats) * 100
  if (seatsRemaining <= 0) {
    return { label: 'Full',        color: '#EF4444', bg: '#FEF2F2', pct: 100,           variant: 'full'        }
  }
  if (pct >= 80) {
    return { label: 'Almost Full', color: '#F59E0B', bg: '#FFFBEB', pct: Math.round(pct), variant: 'almost-full' }
  }
  return   { label: 'Open',        color: '#10B981', bg: '#ECFDF5', pct: Math.round(pct), variant: 'open'        }
}

/** Single sort dropdown for the section browser */
export const SECTION_ORDER_OPTIONS = [
  { value: 'asc',      label: '🔤 Section A → Z' },
  { value: 'desc',     label: '🔤 Section Z → A' },
  { value: 'num-asc',  label: '🔢 Section No. 1 → 10' },
  { value: 'num-desc', label: '🔢 Section No. 10 → 1' },
]

/** Initial state shape for useRegistrationController */
export const EMPTY_REGISTRATION_STATE = {
  sections:        [],
  myRegistrations: [],
  windowStatus:    null,
  loading:         true,
  error:           null,
  toast:           null,
  toastType:       'success',
  filterCode:      '',
  filterStatus:    'all',   // 'all' | 'open' | 'almost-full' | 'full'
  sortBy:          'code-asc',
  wsConnected:     false,
}

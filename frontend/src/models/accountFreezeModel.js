export const ACCOUNT_ROLES = Object.freeze({ STUDENT: 'Student', FACULTY: 'Faculty' })
export const ACCOUNT_CATEGORIES = Object.freeze([
  { value: 'ALL', label: 'All accounts' },
  { value: 'STUDENT', label: 'Students' },
  { value: 'FACULTY', label: 'Faculty' },
])

export function matchesAccountSearch(account, query) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return [account.userId, account.fullName, account.email, account.role]
    .some(value => String(value || '').toLowerCase().includes(needle))
}

export function matchesAccountCategory(account, category) {
  return category === 'ALL' || account.role === category
}

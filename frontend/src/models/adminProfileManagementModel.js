export const EMPTY_ADMIN_PROFILE = {
  userId: '', fullName: '', email: '', role: 'STUDENT', isAdvisor: false,
  department: '', year: '', cgpa: '', completedCredits: '', createdAt: '',
}

export const ADMIN_PROFILE_ROLES = ['STUDENT', 'FACULTY', 'ADMIN']

export function profileToAdminForm(profile) {
  return {
    ...EMPTY_ADMIN_PROFILE,
    ...profile,
    department: profile.department ?? '',
    year: profile.year ?? '',
    cgpa: profile.cgpa ?? '',
    completedCredits: profile.completedCredits ?? '',
    isAdvisor: profile.isAdvisor === true,
  }
}

export function buildAdminProfilePayload(form) {
  const payload = {
    fullName: form.fullName.trim(), email: form.email.trim(), role: form.role,
    isAdvisor: form.role === 'FACULTY' && form.isAdvisor,
  }
  if (form.department !== '') payload.department = form.department.trim()
  if (form.year !== '') payload.year = Number(form.year)
  if (form.cgpa !== '') payload.cgpa = Number(form.cgpa)
  if (form.completedCredits !== '') payload.completedCredits = Number(form.completedCredits)
  return payload
}

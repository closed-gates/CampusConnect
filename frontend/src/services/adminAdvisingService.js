import apiClient from './apiClient.js'

/**
 * adminAdvisingService.js – Service layer for Admin Advising and Faculty Advisor management.
 *
 * MVC Role: Service
 */
export const adminAdvisingService = {

  /**
   * Fetch all faculty members and their Advisor assignment status.
   * @returns {Promise<Array>}
   */
  async getFacultyAdvisors() {
    const res = await apiClient.get('/api/admin/advisors/faculty-list')
    if (!res.ok) throw new Error(`Failed to load faculty advisors (${res.status})`)
    return res.json()
  },

  /**
   * Toggle or set the Advisor role for a faculty member.
   * @param {string} userId
   * @param {boolean} [isAdvisor]
   * @returns {Promise<Object>}
   */
  async toggleAdvisor(userId, isAdvisor) {
    const body = typeof isAdvisor === 'boolean' ? { isAdvisor } : {}
    const res = await apiClient.post(`/api/admin/advisors/toggle/${userId}`, body)
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to update advisor role')
    return data
  },

  /**
   * Create a new course section (Admin superpower).
   * @param {Object} sectionData
   * @returns {Promise<Object>}
   */
  async createCourseSection(sectionData) {
    const res = await apiClient.post('/api/admin/sections/create', sectionData)
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to create course section')
    return data
  },

  /**
   * Force-enroll a student into a section by bypassing seat capacity limits.
   * @param {string} studentId
   * @param {string} sectionId
   * @returns {Promise<Object>}
   */
  async forceRegisterStudent(studentId, sectionId) {
    const res = await apiClient.post('/api/admin/registration/force-register', {
      studentId,
      sectionId,
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to force register student')
    return data
  },

  /**
   * Query dynamic advisor status for a given user ID.
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async getAdvisorStatus(userId) {
    const res = await apiClient.get(`/api/advisors/status/${userId}`)
    if (!res.ok) return { isAdvisor: false }
    return res.json()
  },

  /**
   * Fetch the current advising portal open/closed status.
   * Accessible to any authenticated user.
   * @returns {Promise<{isOpen: boolean, message: string, updatedBy: string, updatedAt: string}>}
   */
  async getPortalStatus() {
    const res = await apiClient.get('/api/admin/advising-portal/status')
    if (!res.ok) return { isOpen: true, message: '' }
    return res.json()
  },

  /**
   * Set the advising portal open/closed state (Admin only).
   * @param {boolean} isOpen
   * @param {string}  [message] - Optional custom notice for students
   * @returns {Promise<Object>}
   */
  async setPortalStatus(isOpen, message = '') {
    const res = await apiClient.post('/api/admin/advising-portal/toggle', { isOpen, message })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Failed to update portal status')
    return data
  }
}

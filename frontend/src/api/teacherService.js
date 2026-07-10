import http, { unwrap } from './http'

// Maps 1:1 to TeacherController (/api/schools/{schoolId}/teachers). Every
// method needs schoolId explicitly — Principal callers should always pass
// their own school id from the auth store's user.schoolId, never a route
// param, since the backend independently enforces "own school only" and a
// mismatched id just becomes a 403 the UI has to handle anyway.
export const teacherService = {
  list(schoolId, { page = 0, size = 20 } = {}) {
    return unwrap(http.get(`/schools/${schoolId}/teachers`, { params: { page, size } }))
  },

  /**
   * @returns {Promise<{tempPassword: string}>} shown to the Principal ONCE —
   * the backend never returns it again after this call.
   */
  create(schoolId, { name, email }) {
    return unwrap(http.post(`/schools/${schoolId}/teachers`, { name, email }))
  },

  /** Soft delete — sets status INACTIVE. */
  deactivate(schoolId, teacherId) {
    return unwrap(http.delete(`/schools/${schoolId}/teachers/${teacherId}`))
  },

  /** @returns {Promise<{tempPassword: string}>} same one-time-display rule as create(). */
  resetPassword(schoolId, teacherId) {
    return unwrap(http.patch(`/schools/${schoolId}/teachers/${teacherId}/reset-password`))
  }
}

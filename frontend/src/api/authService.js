import http, { unwrap } from './http'

// Maps to the backend auth/session endpoints. There is still no self-service
// password reset or registration flow (ADR-001, admin-mediated resets only).
export const authService = {
  /** @returns {Promise<{accessToken, user}>} */
  login(email, password) {
    return unwrap(http.post('/auth/login', { email, password }))
  },

  /** @returns {Promise<string>} new access token */
  refresh() {
    return unwrap(http.post('/auth/refresh'))
  },

  /** @returns {Promise<{id, name, email, role, schoolId, mustChangePassword}>} */
  me() {
    return unwrap(http.get('/users/me'))
  },

  logout() {
    return unwrap(http.post('/auth/logout'))
  }
}

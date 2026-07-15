import { USE_MOCK } from '@/config'
import { mockAuthService } from './mock/mockAuthService'
import http, { unwrap } from './http'

const realAuthService = {
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

export const authService = USE_MOCK ? mockAuthService : realAuthService

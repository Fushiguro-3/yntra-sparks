import { USE_MOCK } from '@/config'
import { mockPrincipalService } from './mock/mockPrincipalService'
import http, { unwrap } from './http'

const realPrincipalService = {
  list(schoolId, { page = 0, size = 20 } = {}) {
    return unwrap(http.get(`/schools/${schoolId}/principals`, { params: { page, size } }))
  },

  /** @returns {Promise<{tempPassword: string}>} shown ONCE — never retrievable again */
  create(schoolId, { name, email }) {
    return unwrap(http.post(`/schools/${schoolId}/principals`, { name, email }))
  },

  deactivate(schoolId, principalId) {
    return unwrap(http.delete(`/schools/${schoolId}/principals/${principalId}`))
  },

  activate(schoolId, principalId) {
    return unwrap(http.patch(`/schools/${schoolId}/principals/${principalId}/activate`))
  },

  /** @returns {Promise<{tempPassword: string}>} */
  resetPassword(schoolId, principalId) {
    return unwrap(http.patch(`/schools/${schoolId}/principals/${principalId}/reset-password`))
  }
}

export const principalService = USE_MOCK ? mockPrincipalService : realPrincipalService

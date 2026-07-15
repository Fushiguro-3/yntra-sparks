import { USE_MOCK } from '@/config'
import { mockSchoolService } from './mock/mockSchoolService'
import http, { unwrap } from './http'

const realSchoolService = {
  /** @returns {Promise<{content, page, size, totalElements, totalPages}>} */
  list({ page = 0, size = 20, sort = 'createdAt,desc' } = {}) {
    return unwrap(http.get('/schools', { params: { page, size, sort } }))
  },

  getById(id) {
    return unwrap(http.get(`/schools/${id}`))
  },

  create({ name, email, address }) {
    return unwrap(http.post('/schools', { name, email, address }))
  },

  update(id, { name, email, address }) {
    return unwrap(http.put(`/schools/${id}`, { name, email, address }))
  },

  /** status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL' */
  setStatus(id, status) {
    return unwrap(http.patch(`/schools/${id}/status`, { status }))
  }
}

export const schoolService = USE_MOCK ? mockSchoolService : realSchoolService

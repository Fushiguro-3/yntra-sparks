import http, { unwrap } from './http'

// Maps 1:1 to SchoolController (/api/schools). Pageable uses Spring's
// zero-indexed `page` param — keep that indexing at this layer so callers
// think in 0-indexed pages consistently with what the backend returns.
export const schoolService = {
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

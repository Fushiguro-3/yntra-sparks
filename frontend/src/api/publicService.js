import http, { unwrap } from './http'

export const publicService = {
  listKits({ grade = '', page = 0, size = 12 } = {}) {
    const params = { page, size }
    if (grade) params.grade = grade
    return unwrap(http.get('/public/kits', { params }))
  },

  getKit(id) {
    return unwrap(http.get(`/public/kits/${id}`))
  },

  submitContact(payload) {
    return unwrap(http.post('/contact', payload))
  }
}

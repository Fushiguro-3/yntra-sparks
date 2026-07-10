import http, { unwrap } from './http'

export const contactService = {
  list({ page = 0, size = 20 } = {}) {
    return unwrap(http.get('/contact', { params: { page, size } }))
  },

  delete(id) {
    return unwrap(http.delete(`/contact/${id}`))
  }
}

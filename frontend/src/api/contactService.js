import { USE_MOCK } from '@/config'
import { mockContactService } from './mock/mockContactService'
import http, { unwrap } from './http'

const realContactService = {
  list({ page = 0, size = 20 } = {}) {
    return unwrap(http.get('/contact', { params: { page, size } }))
  },

  delete(id) {
    return unwrap(http.delete(`/contact/${id}`))
  }
}

export const contactService = USE_MOCK ? mockContactService : realContactService

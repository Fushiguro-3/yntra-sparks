import { USE_MOCK } from '@/config'
import { mockCategoryService } from './mock/mockCategoryService'
import http, { unwrap } from './http'

const realCategoryService = {
  /** @returns {Promise<Array<{id, name, createdAt}>>} */
  list() {
    return unwrap(http.get('/categories'))
  },

  create(name) {
    return unwrap(http.post('/categories', { name }))
  },

  update(id, name) {
    return unwrap(http.put(`/categories/${id}`, { name }))
  },

  remove(id) {
    return unwrap(http.delete(`/categories/${id}`))
  }
}

export const categoryService = USE_MOCK ? mockCategoryService : realCategoryService

import http, { unwrap } from './http'

// Maps 1:1 to CategoryController (/api/categories). GET is readable by any
// authenticated role (needed for kit filtering); write ops are enforced
// SUPER_ADMIN-only server-side. List is flat/unpaginated by design.
export const categoryService = {
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

  /**
   * Backend blocks this with a 409 if any Kit still references the
   * category — surface err.message from that 409 to the user rather than
   * assume the delete always succeeds.
   */
  remove(id) {
    return unwrap(http.delete(`/categories/${id}`))
  }
}

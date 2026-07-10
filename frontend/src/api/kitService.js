import http, { unwrap } from './http'

// Maps 1:1 to KitController.
//
// NOTE on search: the backend's GET /kits does not implement search or
// categoryId filtering — it only does findByStatus(ACTIVE) /
// findBySchoolId server-side. Don't pass a `search` param here, it'll be
// silently ignored; filter client-side over the loaded page instead. This
// was caught while porting Ervan's service layer — worth double-checking
// against the actual KitService.java before "fixing" it.
export const kitService = {
  /** Super Admin — all active kits. */
  list({ page = 0, size = 20, sort = 'createdAt,desc' } = {}) {
    return unwrap(http.get('/kits', { params: { page, size, sort } }))
  },

  /** Principal / Teacher — only their own school's purchased kits. */
  listForMySchool({ page = 0, size = 20 } = {}) {
    return unwrap(http.get('/kits/school', { params: { page, size } }))
  },

  getById(id) {
    return unwrap(http.get(`/kits/${id}`))
  },

  listSchoolsForKit(id) {
    return unwrap(http.get(`/kits/${id}/schools`))
  },

  /**
   * @param {{title, description, thumbnailUrl, manualPdfUrl, grade, price, categoryId, videos: Array<{title, youtubeVideoId, sequence}>}} payload
   */
  create(payload) {
    return unwrap(http.post('/kits', payload))
  },

  uploadManual(file) {
    const formData = new FormData()
    formData.append('file', file)
    return unwrap(http.post('/kits/manuals', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }))
  },

  update(id, payload) {
    return unwrap(http.put(`/kits/${id}`, payload))
  },

  /** Soft delete — sets KitStatus.ARCHIVED, never a hard DELETE. */
  archive(id) {
    return unwrap(http.delete(`/kits/${id}`))
  },

  assignToSchool(schoolId, kitId) {
    return unwrap(http.post(`/schools/${schoolId}/kits/${kitId}`))
  },

  revokeFromSchool(schoolId, kitId) {
    return unwrap(http.delete(`/schools/${schoolId}/kits/${kitId}`))
  }
}

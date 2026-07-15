import { USE_MOCK } from '@/config'
import { mockKitService } from './mock/mockKitService'
import http, { unwrap } from './http'

// In mock mode, listForMySchool needs the schoolId from the auth store since
// there's no real JWT. We defer the import to call time to avoid circular deps.
const mockKitServiceWrapped = {
  ...mockKitService,
  listForMySchool(opts) {
    // Dynamic import at call time — store is always initialised by the time
    // a Principal/Teacher view loads.
    return import('@/stores/auth').then(({ useAuthStore }) => {
      const schoolId = useAuthStore().user?.schoolId
      return mockKitService.listForMySchool(opts, schoolId)
    })
  }
}

const realKitService = {
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

  getManualDownloadUrl(key) {
    return unwrap(http.get(`/kits/manuals/${key}/download-url`))
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

export const kitService = USE_MOCK ? mockKitServiceWrapped : realKitService

import { USE_MOCK } from '@/config'
import { mockTeacherService } from './mock/mockTeacherService'
import http, { unwrap } from './http'

const realTeacherService = {
  list(schoolId, { page = 0, size = 20 } = {}) {
    return unwrap(http.get(`/schools/${schoolId}/teachers`, { params: { page, size } }))
  },

  /** @returns {Promise<{tempPassword: string}>} shown to the Principal ONCE */
  create(schoolId, { name, email }) {
    return unwrap(http.post(`/schools/${schoolId}/teachers`, { name, email }))
  },

  deactivate(schoolId, teacherId) {
    return unwrap(http.delete(`/schools/${schoolId}/teachers/${teacherId}`))
  },

  activate(schoolId, teacherId) {
    return unwrap(http.patch(`/schools/${schoolId}/teachers/${teacherId}/activate`))
  },

  /** @returns {Promise<{tempPassword: string}>} */
  resetPassword(schoolId, teacherId) {
    return unwrap(http.patch(`/schools/${schoolId}/teachers/${teacherId}/reset-password`))
  }
}

export const teacherService = USE_MOCK ? mockTeacherService : realTeacherService

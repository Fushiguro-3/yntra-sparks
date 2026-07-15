import { teachersData } from '@/data/teachers'
import { fakeDelay, toPage, nextMockId } from './mockHelpers'

// In-memory copy keyed by schoolId.
const teachers = Object.fromEntries(
  Object.entries(teachersData).map(([schoolId, list]) => [
    Number(schoolId),
    list.map((t) => ({ ...t })),
  ])
)

function getList(schoolId) {
  const id = Number(schoolId)
  if (!teachers[id]) teachers[id] = []
  return teachers[id]
}

export const mockTeacherService = {
  async list(schoolId, { page = 0, size = 20 } = {}) {
    await fakeDelay()
    return toPage(getList(schoolId), page, size)
  },

  async create(schoolId, { name, email }) {
    await fakeDelay()
    const tempPassword = 'Temp@' + Math.random().toString(36).slice(2, 8)
    const teacher = { id: nextMockId(), name, email, status: 'ACTIVE', schoolId: Number(schoolId), createdAt: new Date().toISOString() }
    getList(schoolId).push(teacher)
    return { tempPassword }
  },

  async deactivate(schoolId, teacherId) {
    await fakeDelay()
    const teacher = getList(schoolId).find((t) => t.id === Number(teacherId))
    if (teacher) teacher.status = 'INACTIVE'
  },

  async activate(schoolId, teacherId) {
    await fakeDelay()
    const teacher = getList(schoolId).find((t) => t.id === Number(teacherId))
    if (teacher) teacher.status = 'ACTIVE'
  },

  async resetPassword(schoolId, teacherId) {
    await fakeDelay()
    const tempPassword = 'Reset@' + Math.random().toString(36).slice(2, 8)
    return { tempPassword }
  }
}

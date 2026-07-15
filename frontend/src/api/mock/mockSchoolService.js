import { schoolsData } from '@/data/schools'
import { fakeDelay, toPage, nextMockId } from './mockHelpers'

// In-memory copy so creates/updates/status changes persist within the session.
let schools = schoolsData.map((s) => ({ ...s }))

export const mockSchoolService = {
  async list({ page = 0, size = 20 } = {}) {
    await fakeDelay()
    return toPage(schools, page, size)
  },

  async getById(id) {
    await fakeDelay()
    const school = schools.find((s) => s.id === Number(id))
    if (!school) throw { message: 'School not found', status: 404 }
    return school
  },

  async create({ name, email, address }) {
    await fakeDelay()
    const school = { id: nextMockId(), name, email, address: address || '', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    schools.push(school)
    return school
  },

  async update(id, { name, email, address }) {
    await fakeDelay()
    const school = schools.find((s) => s.id === Number(id))
    if (!school) throw { message: 'School not found', status: 404 }
    Object.assign(school, { name, email, address: address || '', updatedAt: new Date().toISOString() })
    return school
  },

  async setStatus(id, status) {
    await fakeDelay()
    const school = schools.find((s) => s.id === Number(id))
    if (!school) throw { message: 'School not found', status: 404 }
    school.status = status
    school.updatedAt = new Date().toISOString()
    return school
  }
}

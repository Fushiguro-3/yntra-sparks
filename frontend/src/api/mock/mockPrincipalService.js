import { fakeDelay, toPage, nextMockId } from './mockHelpers'

const principals = {
  1: [
    { id: 201, name: 'Demo Principal', email: 'principal@dps.edu.in', status: 'ACTIVE', schoolId: 1, createdAt: '2024-03-01T10:00:00' },
  ],
  2: [],
  3: [],
  4: [],
}

function getList(schoolId) {
  const id = Number(schoolId)
  if (!principals[id]) principals[id] = []
  return principals[id]
}

export const mockPrincipalService = {
  async list(schoolId, { page = 0, size = 20 } = {}) {
    await fakeDelay()
    return toPage(getList(schoolId), page, size)
  },

  async create(schoolId, { name, email }) {
    await fakeDelay()
    const tempPassword = 'Temp@' + Math.random().toString(36).slice(2, 8)
    const principal = { id: nextMockId(), name, email, status: 'ACTIVE', schoolId: Number(schoolId), createdAt: new Date().toISOString() }
    getList(schoolId).push(principal)
    return { tempPassword }
  },

  async deactivate(schoolId, principalId) {
    await fakeDelay()
    const p = getList(schoolId).find((p) => p.id === Number(principalId))
    if (p) p.status = 'INACTIVE'
  },

  async activate(schoolId, principalId) {
    await fakeDelay()
    const p = getList(schoolId).find((p) => p.id === Number(principalId))
    if (p) p.status = 'ACTIVE'
  },

  async resetPassword(schoolId, principalId) {
    await fakeDelay()
    return { tempPassword: 'Reset@' + Math.random().toString(36).slice(2, 8) }
  }
}

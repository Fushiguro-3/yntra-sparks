import { kitsData, schoolKitAccess } from '@/data/kits'
import { fakeDelay, toPage, nextMockId } from './mockHelpers'
import { mockSchoolService } from './mockSchoolService'

let kits = kitsData.map((k) => ({ ...k, videos: k.videos.map((v) => ({ ...v })) }))
// In-memory school-kit map: kitId → Set of schoolIds
const access = Object.fromEntries(
  Object.entries(schoolKitAccess).map(([kitId, schoolIds]) => [Number(kitId), new Set(schoolIds)])
)

export const mockKitService = {
  async list({ page = 0, size = 20 } = {}) {
    await fakeDelay()
    const active = kits.filter((k) => k.status === 'ACTIVE')
    return toPage(active, page, size)
  },

  async listForMySchool({ page = 0, size = 20 } = {}, schoolId) {
    await fakeDelay()
    const myKitIds = Object.entries(access)
      .filter(([, schools]) => schools.has(Number(schoolId)))
      .map(([kitId]) => Number(kitId))
    const myKits = kits.filter((k) => myKitIds.includes(k.id) && k.status === 'ACTIVE')
    return toPage(myKits, page, size)
  },

  async getById(id) {
    await fakeDelay()
    const kit = kits.find((k) => k.id === Number(id))
    if (!kit) throw { message: 'Kit not found', status: 404 }
    return kit
  },

  async listSchoolsForKit(kitId) {
    await fakeDelay()
    const schoolIds = [...(access[Number(kitId)] ?? [])]
    return Promise.all(schoolIds.map((sid) => mockSchoolService.getById(sid)))
  },

  async create(payload) {
    await fakeDelay()
    const kit = { ...payload, id: nextMockId(), status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
    kits.push(kit)
    access[kit.id] = new Set()
    return kit
  },

  // Manual upload returns a mock key — no real S3 in mock mode.
  async uploadManual(file) {
    await fakeDelay(500)
    return { key: `manuals/mock-${Date.now()}.pdf`, originalFilename: file.name }
  },

  async update(id, payload) {
    await fakeDelay()
    const index = kits.findIndex((k) => k.id === Number(id))
    if (index === -1) throw { message: 'Kit not found', status: 404 }
    kits[index] = { ...kits[index], ...payload, id: Number(id), updatedAt: new Date().toISOString() }
    return kits[index]
  },

  async archive(id) {
    await fakeDelay()
    const kit = kits.find((k) => k.id === Number(id))
    if (!kit) throw { message: 'Kit not found', status: 404 }
    kit.status = 'ARCHIVED'
  },

  async assignToSchool(schoolId, kitId) {
    await fakeDelay()
    if (!access[Number(kitId)]) access[Number(kitId)] = new Set()
    access[Number(kitId)].add(Number(schoolId))
  },

  async revokeFromSchool(schoolId, kitId) {
    await fakeDelay()
    access[Number(kitId)]?.delete(Number(schoolId))
  },

  // Returns a real public PDF so the manual viewer works in demo/mock mode.
  async getManualDownloadUrl(_key) {
    await fakeDelay(100)
    return { downloadUrl: 'https://www.w3.org/WAI/WCAG21/wcag21.pdf' }
  }
}

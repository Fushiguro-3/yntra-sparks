import { kitsData } from '@/data/kits'
import { fakeDelay, toPage } from './mockHelpers'

export const mockPublicService = {
  async listKits({ grade = '', page = 0, size = 12 } = {}) {
    await fakeDelay()
    const active = kitsData.filter((k) => k.status === 'ACTIVE' && (!grade || k.grade === grade))
    return toPage(active, page, size)
  },

  async getKit(id) {
    await fakeDelay()
    const kit = kitsData.find((k) => k.id === Number(id))
    if (!kit) throw { message: 'Kit not found', status: 404 }
    return kit
  },

  async submitContact(payload) {
    await fakeDelay(400)
    return { message: 'Message received. We will get back to you shortly.' }
  }
}

import { contactsData } from '@/data/contacts'
import { fakeDelay, toPage } from './mockHelpers'

let contacts = contactsData.map((c) => ({ ...c }))

export const mockContactService = {
  async list({ page = 0, size = 20 } = {}) {
    await fakeDelay()
    return toPage([...contacts].reverse(), page, size)
  },

  async delete(id) {
    await fakeDelay()
    contacts = contacts.filter((c) => c.id !== Number(id))
  }
}

// Seam between the Super Admin Messages page and two message sources:
//   1. contactService (src/api/contactService.js) — the "real" backend
//      /contact endpoint (mock or live depending on VITE_USE_MOCK). Today
//      nothing writes to this in practice since the public form bypasses
//      it (see ContactView.vue) — it exists so this seam is a no-op change
//      once the backend actually implements /contact.
//   2. web3formsMessageStore (src/services/web3formsMessageStore.js) — a
//      frontend-only localStorage cache of everything Web3Forms confirmed
//      delivering, tagged `source: 'web3forms'`.
//
// Every message carries a `source` field ('backend' | 'web3forms') so the
// UI can label them distinctly. When the backend /contact endpoint is
// live for real, delete web3formsMessageStore.js and simplify list()/
// remove() back down to plain contactService calls — everything else
// (MessagesView.vue) keeps working unchanged.
import { contactService } from '@/api/contactService'
import { web3formsMessageStore } from './web3formsMessageStore'
import { messageStatusStore } from './messageStatusStore'
import { paginate } from '@/utils/paginate'

// contactService.list() is itself paginated (mock or real backend), but we
// need every backend message in memory to merge and re-sort against the
// locally-stored Web3Forms messages. A page size this large is a pragmatic
// stopgap for a source that's empty in practice today — see the header
// comment above and docs/frontend-api-dependencies.md for the real fix.
const BACKEND_FETCH_SIZE = 1000

async function loadMerged() {
  const backendPage = await contactService.list({ page: 0, size: BACKEND_FETCH_SIZE })
  const backendMessages = (backendPage.content || []).map((m) => ({ ...m, source: m.source || 'backend' }))
  const web3formsMessages = web3formsMessageStore.getAll()

  return [...backendMessages, ...web3formsMessages]
    .map((m) => ({ ...m, status: messageStatusStore.getStatus(m.id) }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export const messagesService = {
  async list({ page = 0, size = 20 } = {}) {
    const merged = await loadMerged()
    return paginate(merged, page, size)
  },

  /** Unread count across the whole inbox — used for sidebar/dashboard badges. */
  async countUnread() {
    const merged = await loadMerged()
    return merged.filter((m) => m.status === 'unread').length
  },

  markRead(message) {
    messageStatusStore.setStatus(message.id, 'read')
  },

  markUnread(message) {
    messageStatusStore.setStatus(message.id, 'unread')
  },

  archive(message) {
    messageStatusStore.setStatus(message.id, 'archived')
  },

  /** Restores an archived message back to 'read' — it was, definitionally, already seen. */
  restore(message) {
    messageStatusStore.setStatus(message.id, 'read')
  },

  async delete(message) {
    if (message.source === 'web3forms') {
      web3formsMessageStore.remove(message.id)
      return
    }
    await contactService.delete(message.id)
  }
}

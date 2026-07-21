// Frontend-only persistence for Contact form submissions.
//
// The public Contact form (src/views/public/ContactView.vue) delivers mail
// via Web3Forms directly — the backend's /contact endpoint is not wired up
// yet (see docs/frontend-api-dependencies.md). So that Super Admin can
// still see submissions somewhere, every message Web3Forms confirms as
// sent gets written here, to localStorage, tagged `source: 'web3forms'`.
//
// This is intentionally kept separate from src/api/contactService.js (the
// "backend" messages source, mock or real). src/services/messagesService.js
// is the seam that merges the two for the Super Admin Messages page. When
// the backend /contact endpoint exists for real, delete this file and the
// merge in messagesService.js — nothing else needs to change.
const STORAGE_KEY = 'ys_web3forms_messages_v1'

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Corrupt data or localStorage unavailable (private browsing quota,
    // etc.) — fail safe to an empty list rather than throwing.
    return []
  }
}

function writeAll(messages) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch {
    // Best-effort only. If storage is full/unavailable the message still
    // reached the subscriber's inbox via Web3Forms — losing the local
    // Messages-page copy is not worth surfacing an error to the visitor.
  }
}

export const web3formsMessageStore = {
  getAll() {
    return readAll().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  /** Call only after Web3Forms confirms the submission succeeded. */
  add({ name, email, subject, message }) {
    const entry = {
      id: `web3forms-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
      source: 'web3forms'
    }
    const messages = readAll()
    messages.push(entry)
    writeAll(messages)
    return entry
  },

  remove(id) {
    writeAll(readAll().filter((m) => m.id !== id))
  }
}

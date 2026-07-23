// Frontend-only per-user notification centre persistence. Generated only
// at a small set of concrete, deterministic points in the app (see
// callers) — never a speculative background event bus — and deduped via
// an optional `dedupeKey` so the same event can never create two entries.
import { readJSON, writeJSON } from '@/utils/mockStorage'

const STORAGE_PREFIX = 'ys_notifications_v1_'
const MAX_ENTRIES = 50

function key(userId) {
  return `${STORAGE_PREFIX}${userId ?? 'anon'}`
}

function readAll(userId) {
  return readJSON(key(userId), [])
}

function writeAll(userId, entries) {
  writeJSON(key(userId), entries)
}

export const notificationStore = {
  list(userId) {
    return readAll(userId)
  },

  /**
   * @param {{type: string, title: string, message: string, to?: {name: string}|null, dedupeKey?: string|null}} payload
   */
  add(userId, { type, title, message, to = null, dedupeKey = null }) {
    const entries = readAll(userId)
    if (dedupeKey && entries.some((n) => n.dedupeKey === dedupeKey)) return entries

    entries.unshift({
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      title,
      message,
      to,
      dedupeKey,
      read: false,
      createdAt: new Date().toISOString()
    })
    const capped = entries.slice(0, MAX_ENTRIES)
    writeAll(userId, capped)
    return capped
  },

  markRead(userId, id) {
    const entries = readAll(userId)
    const target = entries.find((n) => n.id === id)
    if (target) target.read = true
    writeAll(userId, entries)
    return entries
  },

  markAllRead(userId) {
    const entries = readAll(userId).map((n) => ({ ...n, read: true }))
    writeAll(userId, entries)
    return entries
  },

  remove(userId, id) {
    const entries = readAll(userId).filter((n) => n.id !== id)
    writeAll(userId, entries)
    return entries
  }
}

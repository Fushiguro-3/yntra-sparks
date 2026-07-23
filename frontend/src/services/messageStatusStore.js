// Frontend-only read/unread/archived status for Super Admin contact
// messages. Deliberately keyed by message id, NOT by user id — unlike
// profileStore/savedKitsStore/recentlyViewedStore, the inbox is one shared
// organisational resource (any Super Admin sees the same messages), not
// personal data, so per-user scoping doesn't apply here.
//
// Messages come from two sources (see messagesService.js): the mock/real
// backend (in-memory, resets on reload) and Web3Forms (localStorage). This
// store is the single source of truth for status regardless of source, and
// anything with no recorded status yet — including messages from either
// source seen for the very first time — defaults to 'unread'.
import { readJSON, writeJSON } from '@/utils/mockStorage'

const STORAGE_KEY = 'ys_message_status_v1'

export const VALID_STATUSES = ['unread', 'read', 'archived']

export const messageStatusStore = {
  getStatus(messageId) {
    const status = readJSON(STORAGE_KEY, {})[messageId]
    return VALID_STATUSES.includes(status) ? status : 'unread'
  },

  setStatus(messageId, status) {
    if (!VALID_STATUSES.includes(status)) return
    const statuses = readJSON(STORAGE_KEY, {})
    statuses[messageId] = status
    writeJSON(STORAGE_KEY, statuses)
  }
}

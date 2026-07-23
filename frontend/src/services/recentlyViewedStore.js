// Frontend-only "recently viewed kits" persistence for the Teacher portal
// (localStorage, no backend endpoint exists for this — see
// docs/frontend-api-dependencies.md). Keyed per user id so switching demo
// accounts on the same machine doesn't mix histories.
import { readJSON, writeJSON } from '@/utils/mockStorage'

const STORAGE_PREFIX = 'ys_recently_viewed_kits_v1_'
const MAX_ENTRIES = 8

function key(userId) {
  return `${STORAGE_PREFIX}${userId ?? 'anon'}`
}

export const recentlyViewedStore = {
  list(userId) {
    return readJSON(key(userId), [])
  },

  /** Records a kit view, most-recent first, deduped, capped at MAX_ENTRIES. */
  record(userId, kit) {
    if (!kit?.id) return
    const entries = readJSON(key(userId), []).filter((k) => k.id !== kit.id)
    entries.unshift({
      id: kit.id,
      title: kit.title,
      thumbnailUrl: kit.thumbnailUrl || '',
      grade: kit.grade || '',
      categoryName: kit.categoryName || '',
      viewedAt: new Date().toISOString()
    })
    writeJSON(key(userId), entries.slice(0, MAX_ENTRIES))
  },

  clear(userId) {
    writeJSON(key(userId), [])
  }
}

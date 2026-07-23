// Frontend-only "saved/favourite kits" persistence for Teacher and
// Principal portals (localStorage, no backend endpoint exists for this —
// see docs/frontend-api-dependencies.md). Keyed per user id, same pattern
// as recentlyViewedStore.js, so favourites never leak between users on a
// shared browser and survive refresh/logout/login for the same account.
import { readJSON, writeJSON } from '@/utils/mockStorage'

const STORAGE_PREFIX = 'ys_saved_kits_v1_'

function key(userId) {
  return `${STORAGE_PREFIX}${userId ?? 'anon'}`
}

export const savedKitsStore = {
  list(userId) {
    return readJSON(key(userId), [])
  },

  isSaved(userId, kitId) {
    return readJSON(key(userId), []).some((k) => k.id === kitId)
  },

  /** Denormalizes enough kit info to still render if the kit is later archived. */
  save(userId, kit) {
    if (!kit?.id) return readJSON(key(userId), [])
    const entries = readJSON(key(userId), []).filter((k) => k.id !== kit.id)
    entries.unshift({
      id: kit.id,
      title: kit.title,
      thumbnailUrl: kit.thumbnailUrl || '',
      grade: kit.grade || '',
      categoryName: kit.categoryName || '',
      savedAt: new Date().toISOString()
    })
    writeJSON(key(userId), entries)
    return entries
  },

  remove(userId, kitId) {
    const entries = readJSON(key(userId), []).filter((k) => k.id !== kitId)
    writeJSON(key(userId), entries)
    return entries
  }
}

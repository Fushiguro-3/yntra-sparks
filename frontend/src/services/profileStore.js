// Frontend-only overlay for profile fields the current backend/mock user
// model doesn't carry (phone, avatar color/initials override). Keyed per
// user id, merged on top of the real auth.user at render time — never
// mutates role/schoolId/email, which stay backend-owned. See
// docs/frontend-api-dependencies.md for the real profile-update endpoint
// this should be replaced with once it exists.
import { readJSON, writeJSON } from '@/utils/mockStorage'

const STORAGE_PREFIX = 'ys_profile_overlay_v1_'

const EDITABLE_FIELDS = ['displayName', 'phone', 'avatarUrl']

function key(userId) {
  return `${STORAGE_PREFIX}${userId}`
}

export const profileStore = {
  get(userId) {
    return readJSON(key(userId), {})
  },

  /** Only EDITABLE_FIELDS are ever persisted — protected fields are dropped silently. */
  update(userId, patch) {
    const overlay = readJSON(key(userId), {})
    for (const field of EDITABLE_FIELDS) {
      if (patch[field] !== undefined) overlay[field] = patch[field]
    }
    overlay.updatedAt = new Date().toISOString()
    writeJSON(key(userId), overlay)
    return overlay
  }
}

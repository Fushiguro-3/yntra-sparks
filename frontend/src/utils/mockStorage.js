// Centralized localStorage read/write for every frontend-only mock store
// (profileStore, recentlyViewedStore, savedKitsStore, messageStatusStore,
// teacherInvitationStore, notificationStore, web3formsMessageStore,
// newsletterSubscriberStore) — one place to handle JSON parsing, corrupt
// data, and quota/availability errors instead of each store re-implementing
// the same try/catch.
//
// Naming convention: keys are namespaced `ys_<feature>_v<schema>[_<scopeId>]`
// — the `_v1` suffix is a schema version marker. If a store's shape ever
// changes incompatibly, bump to `_v2` and read (not write) the old key once
// to migrate, then drop it — see profileStore.js's history for the pattern.

/**
 * @param {string} key
 * @param {*} fallback returned if the key is missing, unparseable, or not the expected shape
 */
export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    if (Array.isArray(fallback)) return Array.isArray(parsed) ? parsed : fallback
    if (fallback && typeof fallback === 'object') return parsed && typeof parsed === 'object' ? parsed : fallback
    return parsed
  } catch {
    return fallback
  }
}

/** Best-effort — a full quota or unavailable storage should never throw up into the caller. */
export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

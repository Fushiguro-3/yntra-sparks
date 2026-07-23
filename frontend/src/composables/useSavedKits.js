import { reactive } from 'vue'
import { savedKitsStore } from '@/services/savedKitsStore'

// Shared reactive view of the current user's saved kits — so a Save/Unsave
// toggle on a kit card, the kit detail page, the Saved Kits list, and the
// dashboard count card all update instantly from one source, the same way
// useProfileOverlay/useNotifications work.
//
// IMPORTANT: `load()` is the ONLY function that writes `state`, and it must
// only ever be called from a plain function, watcher, or event handler —
// never from inside a `computed()` getter (see useNotifications.js for the
// full explanation of why — this file used to have that exact bug).
// Consumers should call `load(userId)` once (e.g. via
// `watch(() => props.userId, load, { immediate: true })`) and then use
// `list()`/`isSaved()`, which are pure reads.
const state = reactive({ userId: null, kits: [] })

function load(userId) {
  const normalized = userId ?? null
  state.userId = normalized
  state.kits = normalized ? savedKitsStore.list(normalized) : []
}

function list() {
  return state.kits
}

function isSaved(kitId) {
  return state.kits.some((k) => k.id === kitId)
}

/** @returns {boolean} the new saved state (true = now saved) */
function toggle(userId, kit) {
  if (state.userId !== (userId ?? null)) load(userId)
  if (state.kits.some((k) => k.id === kit.id)) {
    state.kits = savedKitsStore.remove(userId, kit.id)
    return false
  }
  state.kits = savedKitsStore.save(userId, kit)
  return true
}

function remove(userId, kitId) {
  if (state.userId !== (userId ?? null)) load(userId)
  state.kits = savedKitsStore.remove(userId, kitId)
}

export function useSavedKits() {
  return { savedState: state, load, list, isSaved, toggle, remove }
}

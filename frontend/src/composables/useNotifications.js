import { reactive } from 'vue'
import { notificationStore } from '@/services/notificationStore'

// Shared reactive view of the current user's notifications — same
// singleton pattern as useSavedKits/useProfileOverlay, so the bell badge,
// the dropdown, and the full Notifications page all update instantly from
// one source.
//
// IMPORTANT: `load()` is the ONLY function that writes `state`, and it must
// only ever be called from a plain function, watcher, or event handler —
// never from inside a `computed()` getter. A computed that both reads and
// writes the same reactive dependency during its own evaluation can, with
// two sibling component instances sharing this singleton (e.g. the mobile
// and desktop NotificationBell), trigger Vue's "maximum recursive updates"
// guard. Consumers must call `load(userId)` once (e.g. via
// `watch(() => props.userId, load, { immediate: true })`) and then use the
// getters below, which are pure reads.
const state = reactive({ userId: null, items: [] })

function load(userId) {
  const normalized = userId ?? null
  state.userId = normalized
  state.items = normalized ? notificationStore.list(normalized) : []
}

function list() {
  return state.items
}

function unreadCount() {
  return state.items.filter((n) => !n.read).length
}

function notify(userId, payload) {
  if (state.userId !== (userId ?? null)) load(userId)
  state.items = notificationStore.add(userId, payload)
}

function markRead(userId, id) {
  if (state.userId !== (userId ?? null)) load(userId)
  state.items = notificationStore.markRead(userId, id)
}

function markAllRead(userId) {
  if (state.userId !== (userId ?? null)) load(userId)
  state.items = notificationStore.markAllRead(userId)
}

function remove(userId, id) {
  if (state.userId !== (userId ?? null)) load(userId)
  state.items = notificationStore.remove(userId, id)
}

export function useNotifications() {
  return { notificationState: state, load, list, unreadCount, notify, markRead, markAllRead, remove }
}

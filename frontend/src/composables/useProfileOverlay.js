import { reactive } from 'vue'
import { profileStore } from '@/services/profileStore'

// Shared reactive view of the current user's profileStore overlay
// (display name override, phone, avatar). PortalShell/UserMenu read this;
// ProfileView writes to it — so a saved name/avatar shows up in the header
// immediately, without either component needing to know about the other.
const state = reactive({ userId: null, overlay: {} })

function load(userId) {
  state.userId = userId ?? null
  state.overlay = userId ? profileStore.get(userId) : {}
}

function update(userId, patch) {
  state.overlay = profileStore.update(userId, patch)
  state.userId = userId
  return state.overlay
}

export function useProfileOverlay() {
  return { overlayState: state, load, update }
}

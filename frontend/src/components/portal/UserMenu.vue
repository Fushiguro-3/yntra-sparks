<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'

// Shared top-right user menu for all three portals (Super Admin, Principal,
// Teacher) — avatar-initials trigger + dropdown with View Profile /
// Dashboard / Change Password / Logout. Replaces the plain email text that
// used to sit in PortalShell's topbar. Logout itself stays owned by
// PortalShell (auth.logout() + redirect) — this just emits the intent.
const props = defineProps({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  avatarUrl: { type: String, default: '' },
  roleLabel: { type: String, required: true },
  profileRoute: { type: String, required: true },
  dashboardRoute: { type: String, required: true },
  notificationsRoute: { type: String, default: '' }
})
const emit = defineEmits(['logout'])

const route = useRoute()
const isOpen = ref(false)
const triggerRef = ref(null)
const wrapperRef = ref(null)

const initials = computed(() => {
  const source = (props.name || props.email || '').trim()
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})

function close() {
  if (!isOpen.value) return
  isOpen.value = false
  nextTick(() => triggerRef.value?.focus())
}
function toggle() {
  isOpen.value = !isOpen.value
}
function handleLogout() {
  isOpen.value = false
  emit('logout')
}

function handleKeydown(e) {
  if (e.key === 'Escape' && isOpen.value) close()
}
function handleClickOutside(e) {
  if (isOpen.value && wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

watch(() => route.fullPath, () => { isOpen.value = false })

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative" ref="wrapperRef">
    <button
      ref="triggerRef"
      type="button"
      class="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 rounded-full hover:bg-navy-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-400"
      aria-haspopup="true"
      :aria-expanded="isOpen"
      aria-label="Account menu"
      @click="toggle"
    >
      <span class="w-9 h-9 rounded-full bg-gradient-to-br from-navy-700 to-navy-900 text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden" aria-hidden="true">
        <img v-if="avatarUrl" :src="avatarUrl" alt="" class="w-full h-full object-cover">
        <span v-else>{{ initials }}</span>
      </span>
      <span class="text-left leading-tight hidden md:block">
        <span class="block text-sm font-semibold text-navy-900 truncate max-w-[10rem]">{{ name || email }}</span>
        <span class="block text-xs text-ink-600">{{ roleLabel }}</span>
      </span>
      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden="true" class="hidden md:block text-slate-400 transition-transform" :class="{ 'rotate-180': isOpen }">
        <path d="M1 1L6 6L11 1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>

    <Transition name="menu-pop">
      <div
        v-if="isOpen"
        role="menu"
        aria-label="Account"
        class="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-[0_20px_44px_rgba(10,31,77,.2)] border border-navy-100 py-2 z-30"
      >
        <div class="px-4 py-2 border-b border-navy-50 md:hidden">
          <p class="text-sm font-semibold text-navy-900 truncate">{{ name || email }}</p>
          <p class="text-xs text-ink-600">{{ roleLabel }}</p>
        </div>
        <RouterLink :to="{ name: dashboardRoute }" role="menuitem" class="block px-4 py-2.5 text-sm text-ink-900 hover:bg-navy-50 transition-colors" @click="close">Dashboard</RouterLink>
        <RouterLink :to="{ name: profileRoute }" role="menuitem" class="block px-4 py-2.5 text-sm text-ink-900 hover:bg-navy-50 transition-colors" @click="close">My Profile</RouterLink>
        <RouterLink :to="{ name: 'change-password' }" role="menuitem" class="block px-4 py-2.5 text-sm text-ink-900 hover:bg-navy-50 transition-colors" @click="close">Change Password</RouterLink>
        <RouterLink v-if="notificationsRoute" :to="{ name: notificationsRoute }" role="menuitem" class="block px-4 py-2.5 text-sm text-ink-900 hover:bg-navy-50 transition-colors" @click="close">Notifications</RouterLink>
        <div class="border-t border-navy-50 mt-1 pt-1">
          <button type="button" role="menuitem" class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors" @click="handleLogout">Log out</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

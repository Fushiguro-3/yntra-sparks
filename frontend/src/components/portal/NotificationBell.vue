<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useNotifications } from '@/composables/useNotifications'

const props = defineProps({
  userId: { type: [String, Number], default: null },
  viewAllRoute: { type: String, required: true }
})

const route = useRoute()
const { load, list, unreadCount, markRead, markAllRead } = useNotifications()

// load() is a plain side-effecting call, safe from a watcher — never call
// it from inside a computed (see useNotifications.js for why).
watch(() => props.userId, load, { immediate: true })

const isOpen = ref(false)
const triggerRef = ref(null)
const wrapperRef = ref(null)

const items = computed(() => list())
const recent = computed(() => items.value.slice(0, 8))
const count = computed(() => unreadCount())

// Notification `to` targets are generated entirely by our own code (see
// callers of useNotifications().notify), never from user input — this
// whitelist is defense-in-depth in case localStorage is hand-edited, so a
// malformed/tampered entry can never navigate anywhere but a known route.
const ALLOWED_ROUTES = new Set([
  'admin-dashboard', 'admin-schools', 'admin-principals', 'admin-categories', 'admin-kits', 'admin-messages', 'admin-profile',
  'principal-dashboard', 'principal-kits', 'principal-teachers', 'principal-saved-kits', 'principal-profile',
  'teacher-dashboard', 'teacher-kits', 'teacher-saved-kits', 'teacher-profile'
])

function targetFor(item) {
  if (item.to && typeof item.to === 'object' && ALLOWED_ROUTES.has(item.to.name)) return item.to
  return { name: props.viewAllRoute }
}

function toggle() {
  isOpen.value = !isOpen.value
}
function close() {
  if (!isOpen.value) return
  isOpen.value = false
  nextTick(() => triggerRef.value?.focus())
}
function handleItemClick(item) {
  if (!item.read) markRead(props.userId, item.id)
  close()
}
function handleMarkAllRead() {
  markAllRead(props.userId)
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

function formatRelative(value) {
  const diffMs = Date.now() - new Date(value).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
</script>

<template>
  <div class="relative" ref="wrapperRef">
    <button
      ref="triggerRef"
      type="button"
      class="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-navy-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-400"
      aria-haspopup="true"
      :aria-expanded="isOpen"
      aria-label="Notifications"
      @click="toggle"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 22a2.2 2.2 0 0 0 2.2-2.2H9.8A2.2 2.2 0 0 0 12 22z" fill="currentColor" />
        <path d="M18 16v-5a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
      </svg>
      <span v-if="count > 0" class="absolute -top-0.5 -right-0.5 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-spark-500 text-white text-[10px] font-bold flex items-center justify-center" aria-hidden="true">{{ count > 9 ? '9+' : count }}</span>
      <span class="sr-only">{{ count }} unread notifications</span>
    </button>

    <Transition name="menu-pop">
      <div v-if="isOpen" class="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-2xl shadow-[0_20px_44px_rgba(10,31,77,.2)] border border-navy-100 z-30 overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b border-navy-50">
          <p class="font-display font-semibold text-navy-900 text-sm">Notifications</p>
          <button v-if="count > 0" type="button" class="text-xs font-semibold text-navy-700 hover:text-navy-900" @click="handleMarkAllRead">Mark all read</button>
        </div>
        <div class="max-h-80 overflow-y-auto divide-y divide-navy-50">
          <p v-if="recent.length === 0" class="px-4 py-6 text-sm text-ink-600 text-center">You're all caught up.</p>
          <RouterLink
            v-for="item in recent"
            :key="item.id"
            :to="targetFor(item)"
            class="block px-4 py-3 text-sm hover:bg-navy-50 transition-colors"
            :class="{ 'bg-spark-50/40': !item.read }"
            @click="handleItemClick(item)"
          >
            <div class="flex items-start gap-2">
              <span v-if="!item.read" class="mt-1.5 w-1.5 h-1.5 rounded-full bg-spark-500 shrink-0" aria-hidden="true"></span>
              <span class="min-w-0 flex-1">
                <span class="block font-semibold text-navy-900">{{ item.title }}</span>
                <span class="block text-ink-600 text-xs mt-0.5">{{ item.message }}</span>
                <span class="block text-ink-600/70 text-[11px] mt-1">{{ formatRelative(item.createdAt) }}</span>
              </span>
            </div>
          </RouterLink>
        </div>
        <RouterLink :to="{ name: viewAllRoute }" class="block text-center text-sm font-semibold text-navy-700 hover:text-navy-900 px-4 py-3 border-t border-navy-50" @click="close">
          View all
        </RouterLink>
      </div>
    </Transition>
  </div>
</template>

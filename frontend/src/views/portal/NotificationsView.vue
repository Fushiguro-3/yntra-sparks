<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useNotifications } from '@/composables/useNotifications'
import PageHeader from '@/components/PageHeader.vue'
import AppButton from '@/components/AppButton.vue'

const auth = useAuthStore()
const { load, list, unreadCount, markRead, markAllRead, remove } = useNotifications()

// Plain synchronous call at setup-time (not inside a computed) — safe.
load(auth.user?.id)

const filter = ref('all') // 'all' | 'unread'
const items = computed(() => list())
const filtered = computed(() => (filter.value === 'unread' ? items.value.filter((n) => !n.read) : items.value))
const count = computed(() => unreadCount())

const ALLOWED_ROUTES = new Set([
  'admin-dashboard', 'admin-schools', 'admin-principals', 'admin-categories', 'admin-kits', 'admin-messages', 'admin-profile',
  'principal-dashboard', 'principal-kits', 'principal-teachers', 'principal-saved-kits', 'principal-profile',
  'teacher-dashboard', 'teacher-kits', 'teacher-saved-kits', 'teacher-profile'
])
function safeTo(item) {
  return item.to && typeof item.to === 'object' && ALLOWED_ROUTES.has(item.to.name) ? item.to : null
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function handleClick(item) {
  if (!item.read) markRead(auth.user?.id, item.id)
}
</script>

<template>
  <div>
    <PageHeader eyebrow="Stay informed" title="Notifications" subtitle="Important updates for your account and school.">
      <AppButton v-if="count > 0" variant="outline" @click="markAllRead(auth.user?.id)">Mark all read</AppButton>
    </PageHeader>

    <div class="flex flex-wrap gap-2 mb-5" role="tablist" aria-label="Notification filters">
      <button
        type="button"
        role="tab"
        :aria-selected="filter === 'all'"
        class="px-3.5 py-1.5 rounded-full text-sm font-semibold transition"
        :class="filter === 'all' ? 'bg-navy-800 text-white' : 'bg-white border border-navy-100 text-ink-600 hover:border-navy-300'"
        @click="filter = 'all'"
      >
        All
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="filter === 'unread'"
        class="px-3.5 py-1.5 rounded-full text-sm font-semibold transition"
        :class="filter === 'unread' ? 'bg-navy-800 text-white' : 'bg-white border border-navy-100 text-ink-600 hover:border-navy-300'"
        @click="filter = 'unread'"
      >
        Unread
        <span v-if="count > 0" class="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-spark-500 text-white text-xs">{{ count }}</span>
      </button>
    </div>

    <div v-if="filtered.length === 0" class="empty-state app-surface rounded-[24px]">
      {{ filter === 'unread' ? "You're all caught up." : "You don't have any notifications yet." }}
    </div>

    <div v-else class="app-surface rounded-[24px] overflow-hidden divide-y divide-navy-50">
      <component
        :is="safeTo(item) ? 'RouterLink' : 'div'"
        v-for="item in filtered"
        :key="item.id"
        :to="safeTo(item) || undefined"
        class="flex items-start gap-3 px-5 py-4 hover:bg-navy-50/60 transition-colors"
        :class="{ 'bg-spark-50/30': !item.read }"
        @click="handleClick(item)"
      >
        <span class="mt-1.5 w-2 h-2 rounded-full shrink-0" :class="item.read ? 'bg-transparent border border-slate-300' : 'bg-spark-500'" aria-hidden="true"></span>
        <span class="min-w-0 flex-1">
          <span class="flex items-center justify-between gap-3">
            <span class="font-semibold text-navy-900">{{ item.title }}</span>
            <span class="text-xs text-ink-600 shrink-0">{{ formatDate(item.createdAt) }}</span>
          </span>
          <span class="block text-sm text-ink-600 mt-1">{{ item.message }}</span>
          <span v-if="!item.read" class="inline-block mt-2 text-[11px] font-semibold uppercase tracking-wide text-spark-600">Unread</span>
        </span>
        <button
          type="button"
          class="text-xs font-semibold text-slate-400 hover:text-red-600 shrink-0"
          :aria-label="`Dismiss notification: ${item.title}`"
          @click.stop.prevent="remove(auth.user?.id, item.id)"
        >
          Dismiss
        </button>
      </component>
    </div>
  </div>
</template>

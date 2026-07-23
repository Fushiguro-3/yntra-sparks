<script setup>
import { onMounted, ref } from 'vue'
import { schoolService } from '@/api/schoolService'
import { kitService } from '@/api/kitService'
import { categoryService } from '@/api/categoryService'
import { principalService } from '@/api/principalService'
import { messagesService } from '@/services/messagesService'
import PageHeader from '@/components/PageHeader.vue'

const isLoading = ref(true)
const errorMessage = ref('')

const schoolCount = ref(0)
const kitCount = ref(0)
const categoryCount = ref(0)
const messageCount = ref(0)
const unreadMessageCount = ref(0)
const principalCount = ref(0)
const pendingApprovalSchoolCount = ref(0)
const recentMessages = ref([])
const recentKits = ref([])

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function load() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const [schools, kits, categories, messages, unreadCount] = await Promise.all([
      schoolService.list({ size: 200 }),
      kitService.list({ size: 200 }),
      categoryService.list(),
      messagesService.list({ size: 5 }),
      messagesService.countUnread()
    ])
    schoolCount.value = schools.totalElements ?? schools.content?.length ?? 0
    kitCount.value = kits.totalElements ?? kits.content?.length ?? 0
    categoryCount.value = categories.length
    messageCount.value = messages.totalElements ?? messages.content?.length ?? 0
    unreadMessageCount.value = unreadCount
    pendingApprovalSchoolCount.value = (schools.content || []).filter((s) => s.status === 'PENDING_APPROVAL').length
    recentMessages.value = messages.content || []
    recentKits.value = [...(kits.content || [])]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 5)

    // Best-effort: no single "all principals" endpoint exists (principalService
    // is scoped per school), so sum across schools. Failure here shouldn't
    // block the rest of the dashboard.
    try {
      const counts = await Promise.all((schools.content || []).map((s) => principalService.list(s.id, { size: 1 })))
      principalCount.value = counts.reduce((sum, page) => sum + (page.totalElements ?? page.content?.length ?? 0), 0)
    } catch {
      principalCount.value = 0
    }
  } catch (err) {
    errorMessage.value = err.message || 'Could not load dashboard data.'
  } finally {
    isLoading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader eyebrow="Overview" title="Command centre" subtitle="A snapshot of schools, kits, and inbound messages." />

    <div v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-3">
      <span>{{ errorMessage }}</span>
      <button type="button" class="app-button-outline shrink-0" @click="load">Retry</button>
    </div>

    <div v-if="isLoading" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div v-for="n in 6" :key="n" class="skeleton h-24 rounded-2xl"></div>
    </div>
    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <RouterLink :to="{ name: 'admin-schools' }" class="app-surface rounded-2xl p-5 hover-glow transition">
        <p class="text-xs font-semibold uppercase tracking-wide text-ink-600">Schools</p>
        <p class="font-display font-bold text-3xl text-navy-900 mt-1">{{ schoolCount }}</p>
      </RouterLink>
      <RouterLink :to="{ name: 'admin-principals' }" class="app-surface rounded-2xl p-5 hover-glow transition">
        <p class="text-xs font-semibold uppercase tracking-wide text-ink-600">Principals</p>
        <p class="font-display font-bold text-3xl text-navy-900 mt-1">{{ principalCount }}</p>
      </RouterLink>
      <RouterLink :to="{ name: 'admin-kits' }" class="app-surface rounded-2xl p-5 hover-glow transition">
        <p class="text-xs font-semibold uppercase tracking-wide text-ink-600">Kits</p>
        <p class="font-display font-bold text-3xl text-navy-900 mt-1">{{ kitCount }}</p>
      </RouterLink>
      <RouterLink :to="{ name: 'admin-categories' }" class="app-surface rounded-2xl p-5 hover-glow transition">
        <p class="text-xs font-semibold uppercase tracking-wide text-ink-600">Categories</p>
        <p class="font-display font-bold text-3xl text-navy-900 mt-1">{{ categoryCount }}</p>
      </RouterLink>
      <RouterLink :to="{ name: 'admin-messages' }" class="app-surface rounded-2xl p-5 hover-glow transition">
        <p class="text-xs font-semibold uppercase tracking-wide text-ink-600">Messages</p>
        <p class="font-display font-bold text-3xl text-navy-900 mt-1">{{ messageCount }}</p>
      </RouterLink>
      <RouterLink :to="{ name: 'admin-messages', query: { tab: 'unread' } }" class="app-surface rounded-2xl p-5 hover-glow transition">
        <p class="text-xs font-semibold uppercase tracking-wide text-ink-600">Unread messages</p>
        <p class="font-display font-bold text-3xl mt-1" :class="unreadMessageCount > 0 ? 'text-spark-600' : 'text-navy-900'">{{ unreadMessageCount }}</p>
      </RouterLink>
    </div>

    <div v-if="!isLoading && pendingApprovalSchoolCount > 0" class="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-8 flex items-center justify-between gap-3">
      <span>{{ pendingApprovalSchoolCount }} school{{ pendingApprovalSchoolCount === 1 ? '' : 's' }} pending approval.</span>
      <RouterLink :to="{ name: 'admin-schools' }" class="font-semibold underline shrink-0">Review</RouterLink>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div class="app-surface rounded-2xl p-5">
        <p class="app-panel-title mb-3">Recent messages</p>
        <p v-if="!isLoading && recentMessages.length === 0" class="text-sm text-ink-600">No messages yet.</p>
        <ul v-else class="space-y-3">
          <li v-for="m in recentMessages" :key="m.id" class="text-sm border-b border-navy-50 last:border-0 pb-2 last:pb-0">
            <p class="font-semibold text-navy-900 truncate">{{ m.subject || '(no subject)' }}</p>
            <p class="text-ink-600 truncate">{{ m.name }} &middot; {{ formatDate(m.createdAt) }}</p>
          </li>
        </ul>
        <RouterLink :to="{ name: 'admin-messages' }" class="app-action-link text-navy-700 mt-3">View all messages &rarr;</RouterLink>
      </div>

      <div class="app-surface rounded-2xl p-5">
        <p class="app-panel-title mb-3">Recently updated kits</p>
        <p v-if="!isLoading && recentKits.length === 0" class="text-sm text-ink-600">No kits yet.</p>
        <ul v-else class="space-y-3">
          <li v-for="k in recentKits" :key="k.id" class="text-sm border-b border-navy-50 last:border-0 pb-2 last:pb-0">
            <p class="font-semibold text-navy-900 truncate">{{ k.title }}</p>
            <p class="text-ink-600 truncate">{{ k.categoryName || 'Uncategorized' }} &middot; {{ formatDate(k.updatedAt || k.createdAt) }}</p>
          </li>
        </ul>
        <RouterLink :to="{ name: 'admin-kits' }" class="app-action-link text-navy-700 mt-3">Manage kits &rarr;</RouterLink>
      </div>
    </div>

    <div class="app-surface rounded-2xl p-5">
      <p class="app-panel-title mb-3">Quick actions</p>
      <div class="flex flex-wrap gap-3">
        <RouterLink :to="{ name: 'admin-kit-new' }" class="app-button-primary">Add Kit</RouterLink>
        <RouterLink :to="{ name: 'admin-schools' }" class="app-button-outline">Add School</RouterLink>
        <RouterLink :to="{ name: 'admin-categories' }" class="app-button-outline">Add Category</RouterLink>
        <RouterLink :to="{ name: 'admin-principals' }" class="app-button-outline">Manage Principals</RouterLink>
      </div>
    </div>
  </div>
</template>

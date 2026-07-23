<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { schoolService } from '@/api/schoolService'
import { teacherService } from '@/api/teacherService'
import { kitService } from '@/api/kitService'
import { teacherInvitationStore } from '@/services/teacherInvitationStore'
import { useSavedKits } from '@/composables/useSavedKits'
import PageHeader from '@/components/PageHeader.vue'

const auth = useAuthStore()
const { load: loadSavedKits, list: listSavedKits } = useSavedKits()
loadSavedKits(auth.user?.id)
const savedKitCount = computed(() => listSavedKits().length)

const isLoading = ref(true)
const errorMessage = ref('')

const schoolName = ref('')
const teacherCount = ref(0)
const activeTeacherCount = ref(0)
const kitCount = ref(0)
const pendingInvitationCount = ref(0)
const recentTeachers = ref([])

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function load() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const schoolId = auth.user?.schoolId
    const [school, teachers, kits] = await Promise.all([
      schoolService.getById(schoolId),
      teacherService.list(schoolId, { size: 200 }),
      kitService.listForMySchool({ size: 200 })
    ])
    schoolName.value = school?.name || ''
    const teacherList = teachers.content || []
    teacherCount.value = teachers.totalElements ?? teacherList.length
    activeTeacherCount.value = teacherList.filter((t) => t.status === 'ACTIVE').length
    kitCount.value = kits.totalElements ?? kits.content?.length ?? 0
    pendingInvitationCount.value = teacherInvitationStore.listBySchool(schoolId).filter((i) => i.status === 'pending').length
    recentTeachers.value = [...teacherList]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
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
    <PageHeader eyebrow="Overview" :title="schoolName || 'School workspace'" subtitle="Teachers, assigned kits, and recent activity for your school." />

    <div v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-3">
      <span>{{ errorMessage }}</span>
      <button type="button" class="app-button-outline shrink-0" @click="load">Retry</button>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div v-for="n in 5" :key="n" class="skeleton h-24 rounded-2xl"></div>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <RouterLink :to="{ name: 'principal-teachers' }" class="app-surface rounded-2xl p-5 hover-glow transition">
        <p class="text-xs font-semibold uppercase tracking-wide text-ink-600">Teachers</p>
        <p class="font-display font-bold text-3xl text-navy-900 mt-1">{{ teacherCount }}</p>
        <p class="text-xs text-ink-600 mt-1">{{ activeTeacherCount }} active</p>
      </RouterLink>
      <RouterLink :to="{ name: 'principal-teachers', query: { tab: 'invitations' } }" class="app-surface rounded-2xl p-5 hover-glow transition">
        <p class="text-xs font-semibold uppercase tracking-wide text-ink-600">Pending invitations</p>
        <p class="font-display font-bold text-3xl mt-1" :class="pendingInvitationCount > 0 ? 'text-spark-600' : 'text-navy-900'">{{ pendingInvitationCount }}</p>
      </RouterLink>
      <RouterLink :to="{ name: 'principal-kits' }" class="app-surface rounded-2xl p-5 hover-glow transition">
        <p class="text-xs font-semibold uppercase tracking-wide text-ink-600">Assigned kits</p>
        <p class="font-display font-bold text-3xl text-navy-900 mt-1">{{ kitCount }}</p>
      </RouterLink>
      <RouterLink :to="{ name: 'principal-saved-kits' }" class="app-surface rounded-2xl p-5 hover-glow transition">
        <p class="text-xs font-semibold uppercase tracking-wide text-ink-600">Saved kits</p>
        <p class="font-display font-bold text-3xl text-navy-900 mt-1">{{ savedKitCount }}</p>
      </RouterLink>
      <div class="app-surface rounded-2xl p-5">
        <p class="text-xs font-semibold uppercase tracking-wide text-ink-600">School</p>
        <p class="font-display font-bold text-lg text-navy-900 mt-1 truncate">{{ schoolName || '—' }}</p>
      </div>
    </div>

    <div class="app-surface rounded-2xl p-5 mb-8">
      <p class="app-panel-title mb-3">Recently added teachers</p>
      <p v-if="!isLoading && recentTeachers.length === 0" class="text-sm text-ink-600">No teachers yet — add your first one to get started.</p>
      <ul v-else class="space-y-3">
        <li v-for="t in recentTeachers" :key="t.id" class="flex items-center justify-between gap-3 text-sm border-b border-navy-50 last:border-0 pb-2 last:pb-0">
          <div class="min-w-0">
            <p class="font-semibold text-navy-900 truncate">{{ t.name }}</p>
            <p class="text-ink-600 truncate">{{ t.email }} &middot; {{ formatDate(t.createdAt) }}</p>
          </div>
          <span class="shrink-0 text-xs font-semibold" :class="t.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-500'">{{ t.status }}</span>
        </li>
      </ul>
    </div>

    <div class="app-surface rounded-2xl p-5">
      <p class="app-panel-title mb-3">Quick actions</p>
      <div class="flex flex-wrap gap-3">
        <RouterLink :to="{ name: 'principal-teachers' }" class="app-button-primary">Add Teacher</RouterLink>
        <RouterLink :to="{ name: 'principal-kits' }" class="app-button-outline">View Kits</RouterLink>
      </div>
    </div>
  </div>
</template>

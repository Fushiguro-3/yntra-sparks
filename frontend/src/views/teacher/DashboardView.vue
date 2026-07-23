<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { kitService } from '@/api/kitService'
import { recentlyViewedStore } from '@/services/recentlyViewedStore'
import { useSavedKits } from '@/composables/useSavedKits'
import PageHeader from '@/components/PageHeader.vue'

const auth = useAuthStore()
const { load: loadSavedKits, list: listSavedKits } = useSavedKits()
loadSavedKits(auth.user?.id)
const savedKitCount = computed(() => listSavedKits().length)

const isLoading = ref(true)
const errorMessage = ref('')
const kitCount = ref(0)
const recentlyViewed = ref([])

async function load() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const kits = await kitService.listForMySchool({ size: 200 })
    kitCount.value = kits.totalElements ?? kits.content?.length ?? 0
  } catch (err) {
    errorMessage.value = err.message || 'Could not load dashboard data.'
  } finally {
    isLoading.value = false
  }
  recentlyViewed.value = recentlyViewedStore.list(auth.user?.id)
}

onMounted(load)
</script>

<template>
  <div>
    <PageHeader eyebrow="Overview" title="Teacher workspace" subtitle="Your accessible kits and recently viewed lessons." />

    <div v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-3">
      <span>{{ errorMessage }}</span>
      <button type="button" class="app-button-outline shrink-0" @click="load">Retry</button>
    </div>

    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <div v-for="n in 3" :key="n" class="skeleton h-24 rounded-2xl"></div>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <RouterLink :to="{ name: 'teacher-kits' }" class="app-surface rounded-2xl p-5 hover-glow transition">
        <p class="text-xs font-semibold uppercase tracking-wide text-ink-600">Accessible kits</p>
        <p class="font-display font-bold text-3xl text-navy-900 mt-1">{{ kitCount }}</p>
      </RouterLink>
      <RouterLink :to="{ name: 'teacher-saved-kits' }" class="app-surface rounded-2xl p-5 hover-glow transition">
        <p class="text-xs font-semibold uppercase tracking-wide text-ink-600">Saved kits</p>
        <p class="font-display font-bold text-3xl text-navy-900 mt-1">{{ savedKitCount }}</p>
      </RouterLink>
      <div class="app-surface rounded-2xl p-5">
        <p class="text-xs font-semibold uppercase tracking-wide text-ink-600">Recently viewed</p>
        <p class="font-display font-bold text-3xl text-navy-900 mt-1">{{ recentlyViewed.length }}</p>
      </div>
    </div>

    <div class="app-surface rounded-2xl p-5 mb-8">
      <p class="app-panel-title mb-3">Recently viewed kits</p>
      <p v-if="recentlyViewed.length === 0" class="text-sm text-ink-600">Kits you open will show up here for quick access.</p>
      <ul v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <li v-for="kit in recentlyViewed" :key="kit.id">
          <RouterLink
            :to="{ name: 'teacher-kit-detail', params: { id: kit.id } }"
            class="flex items-center gap-3 text-sm bg-white rounded-xl border border-navy-50 hover:border-navy-100 hover-glow-soft transition p-3"
          >
            <span class="w-10 h-10 rounded-lg bg-navy-50 shrink-0 overflow-hidden flex items-center justify-center text-xs font-bold text-navy-700">
              <img v-if="kit.thumbnailUrl" :src="kit.thumbnailUrl" :alt="kit.title" class="w-full h-full object-cover">
              <span v-else aria-hidden="true">STEM</span>
            </span>
            <span class="min-w-0">
              <span class="block font-semibold text-navy-900 truncate">{{ kit.title }}</span>
              <span class="block text-xs text-ink-600 truncate">{{ kit.categoryName || 'STEM Kit' }}</span>
            </span>
          </RouterLink>
        </li>
      </ul>
    </div>

    <div class="app-surface rounded-2xl p-5">
      <p class="app-panel-title mb-3">Quick actions</p>
      <RouterLink :to="{ name: 'teacher-kits' }" class="app-button-primary">Browse Kits</RouterLink>
    </div>
  </div>
</template>

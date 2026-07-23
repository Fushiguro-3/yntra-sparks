<script setup>
import { ref, onMounted } from 'vue'
import { kitService } from '@/api/kitService'
import VideoModal from '@/components/VideoModal.vue'
import SaveKitButton from '@/components/portal/SaveKitButton.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const props = defineProps({
  kitId: { type: String, required: true },
  backRouteName: { type: String, required: true }
})
const emit = defineEmits(['loaded'])

const kit = ref(null)
const activeVideoIndex = ref(0)
const isLoading = ref(true)
const errorMessage = ref('')
const manualDownloadUrl = ref(null)
const isVideoOpen = ref(false)

async function loadKit() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    kit.value = await kitService.getById(props.kitId)
    emit('loaded', kit.value)
    if (kit.value.manualPdfUrl) {
      const key = kit.value.manualPdfUrl.replace('manuals/', '')
      const res = await kitService.getManualDownloadUrl(key)
      manualDownloadUrl.value = res.downloadUrl
    }
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isLoading.value = false
  }
}

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return ''
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(price))
}

onMounted(loadKit)
</script>

<template>
  <div>
    <RouterLink :to="{ name: backRouteName }" class="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-navy-800 transition">&larr; Back to Kits</RouterLink>

    <div v-if="isLoading" class="text-slate-400 text-sm mt-4">Loading…</div>
    <p v-else-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-4">{{ errorMessage }}</p>

    <div v-else-if="kit" class="mt-5 page-enter">
      <div class="dashboard-hero rounded-[26px] p-6 md:p-8 mb-6">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="text-xs text-spark-300 font-bold uppercase tracking-[.16em] mb-2">{{ kit.categoryName ?? kit.category?.name ?? 'STEM kit' }}</p>
          <h1 class="font-display text-2xl md:text-3xl font-bold mb-2">{{ kit.title }}</h1>
        </div>
        <SaveKitButton :kit="kit" :user-id="auth.user?.id" class="shrink-0" />
      </div>
      <div class="flex flex-wrap gap-2 mb-4 text-xs text-slate-600">
        <span v-if="kit.grade" class="rounded-md bg-slate-100 px-2 py-1">{{ kit.grade }}</span>
        <span v-if="kit.price !== null && kit.price !== undefined" class="rounded-md bg-slate-100 px-2 py-1">{{ formatPrice(kit.price) }}</span>
      </div>
      <p class="text-white/75 text-sm mb-1 max-w-2xl">{{ kit.description }}</p>
      </div>

      <div v-if="(kit.videos && kit.videos.length > 0) || manualDownloadUrl" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <button
            v-if="kit.videos && kit.videos.length > 0"
            type="button"
            class="group relative w-full aspect-video bg-navy-900 rounded-xl overflow-hidden text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-400"
            @click="isVideoOpen = true"
          >
            <img
              v-if="kit.thumbnailUrl"
              :src="kit.thumbnailUrl"
              :alt="kit.title"
              class="absolute inset-0 w-full h-full object-cover opacity-55 transition-opacity duration-300 group-hover:opacity-40"
            >
            <span class="relative z-10 flex flex-col items-center justify-center gap-3 w-full h-full">
              <span class="w-14 h-14 rounded-full bg-white/90 text-navy-900 flex items-center justify-center text-xl shadow-lg transition-transform duration-200 group-hover:scale-110" aria-hidden="true">▶</span>
              <span class="font-display font-semibold px-4 text-center">Watch Demo — {{ kit.videos[activeVideoIndex].title }}</span>
            </span>
          </button>
          <div v-else class="app-surface rounded-[20px] p-5">
            <p class="font-medium text-slate-800 mb-2">Manual available</p>
            <p class="text-sm text-slate-500">Open the PDF manual from the panel beside this kit.</p>
          </div>
        </div>

        <div class="space-y-2">
          <div v-if="manualDownloadUrl" class="app-surface rounded-[20px] overflow-hidden mb-4">
            <div class="px-3 py-2.5 border-b border-slate-100 flex items-center justify-between gap-3">
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Manual</p>
              <a :href="manualDownloadUrl" target="_blank" rel="noopener" class="text-xs font-semibold text-navy-700 hover:text-navy-900">Open PDF</a>
            </div>
            <iframe :src="manualDownloadUrl" title="Kit manual PDF" class="w-full h-72 bg-slate-50"></iframe>
          </div>

          <p v-if="kit.videos && kit.videos.length > 0" class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Playlist</p>
          <button
            v-for="(video, index) in kit.videos || []"
            :key="index"
            @click="activeVideoIndex = index"
            class="w-full text-left px-3 py-2.5 rounded-lg text-sm transition flex items-center gap-2"
            :class="index === activeVideoIndex ? 'bg-navy-800 text-white shadow-[0_8px_18px_rgba(10,31,77,.16)]' : 'bg-white border border-navy-100 text-slate-700 hover:bg-navy-50'"
          >
            <span class="text-xs opacity-60">{{ index + 1 }}.</span>
            <span class="truncate">{{ video.title }}</span>
          </button>
        </div>
      </div>

      <div v-else class="empty-state app-surface rounded-[20px]">This kit does not have learning content yet.</div>

      <VideoModal
        v-if="kit.videos && kit.videos.length > 0"
        :show="isVideoOpen"
        :video-id="kit.videos[activeVideoIndex]?.youtubeVideoId || ''"
        :title="kit.videos[activeVideoIndex]?.title || kit.title"
        @close="isVideoOpen = false"
      />
    </div>
  </div>
</template>

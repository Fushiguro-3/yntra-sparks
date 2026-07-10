<script setup>
import { ref, onMounted } from 'vue'
import { kitService } from '@/api/kitService'

const props = defineProps({
  kitId: { type: String, required: true },
  backRouteName: { type: String, required: true }
})

const kit = ref(null)
const activeVideoIndex = ref(0)
const isLoading = ref(true)
const errorMessage = ref('')

async function loadKit() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    kit.value = await kitService.getById(props.kitId)
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
    <RouterLink :to="{ name: backRouteName }" class="text-sm text-slate-500 hover:text-slate-700">&larr; Back to Kits</RouterLink>

    <div v-if="isLoading" class="text-slate-400 text-sm mt-4">Loading…</div>
    <p v-else-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-4">{{ errorMessage }}</p>

    <div v-else-if="kit" class="mt-4">
      <p class="text-xs text-spark-600 font-semibold mb-1">{{ kit.categoryName ?? kit.category?.name ?? 'Uncategorized' }}</p>
      <h1 class="font-display text-xl font-bold text-navy-900 mb-2">{{ kit.title }}</h1>
      <div class="flex flex-wrap gap-2 mb-4 text-xs text-slate-600">
        <span v-if="kit.grade" class="rounded-md bg-slate-100 px-2 py-1">{{ kit.grade }}</span>
        <span v-if="kit.price !== null && kit.price !== undefined" class="rounded-md bg-slate-100 px-2 py-1">{{ formatPrice(kit.price) }}</span>
      </div>
      <p class="text-slate-600 text-sm mb-6 max-w-2xl">{{ kit.description }}</p>

      <div v-if="(kit.videos && kit.videos.length > 0) || kit.manualPdfUrl" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2">
          <div v-if="kit.videos && kit.videos.length > 0" class="aspect-video bg-black rounded-xl overflow-hidden">
            <iframe
              class="w-full h-full"
              :src="`https://www.youtube.com/embed/${kit.videos[activeVideoIndex].youtubeVideoId}`"
              title="Kit video"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
          <p v-if="kit.videos && kit.videos.length > 0" class="mt-3 font-medium text-slate-800">{{ kit.videos[activeVideoIndex].title }}</p>
          <div v-else class="bg-white border border-slate-200 rounded-xl p-5">
            <p class="font-medium text-slate-800 mb-2">Manual available</p>
            <p class="text-sm text-slate-500">Open the PDF manual from the panel beside this kit.</p>
          </div>
        </div>

        <div class="space-y-2">
          <div v-if="kit.manualPdfUrl" class="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4">
            <div class="px-3 py-2.5 border-b border-slate-100 flex items-center justify-between gap-3">
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Manual</p>
              <a :href="kit.manualPdfUrl" target="_blank" rel="noopener" class="text-xs font-semibold text-navy-700 hover:text-navy-900">Open PDF</a>
            </div>
            <iframe :src="kit.manualPdfUrl" title="Kit manual PDF" class="w-full h-72 bg-slate-50"></iframe>
          </div>

          <p v-if="kit.videos && kit.videos.length > 0" class="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Playlist</p>
          <button
            v-for="(video, index) in kit.videos || []"
            :key="index"
            @click="activeVideoIndex = index"
            class="w-full text-left px-3 py-2.5 rounded-lg text-sm transition flex items-center gap-2"
            :class="index === activeVideoIndex ? 'bg-navy-800 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'"
          >
            <span class="text-xs opacity-60">{{ index + 1 }}.</span>
            <span class="truncate">{{ video.title }}</span>
          </button>
        </div>
      </div>

      <p v-else class="text-sm text-slate-400">No videos or manual added to this kit yet.</p>
    </div>
  </div>
</template>

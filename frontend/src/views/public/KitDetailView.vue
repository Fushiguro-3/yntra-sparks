<script setup>
import { computed, onMounted, ref } from 'vue'
import MarketingButton from '@/components/public/MarketingButton.vue'
import { publicService } from '@/api/publicService'

const props = defineProps({
  id: { type: String, required: true }
})

const kit = ref(null)
const activeVideoIndex = ref(0)
const isLoading = ref(true)
const errorMessage = ref('')

const activeVideo = computed(() => kit.value?.videos?.[activeVideoIndex.value] || null)

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return ''
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(price))
}

async function loadKit() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    kit.value = await publicService.getKit(props.id)
    activeVideoIndex.value = 0
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isLoading.value = false
  }
}

onMounted(loadKit)
</script>

<template>
  <section class="max-w-[1440px] mx-auto px-5 md:px-10 pt-10 pb-20">
    <RouterLink :to="{ name: 'public-programs' }" class="text-sm font-semibold text-navy-700 hover:text-navy-900">
      &larr; Back to Programs
    </RouterLink>

    <div v-if="isLoading" class="mt-8 text-sm text-slate-400">Loading kit...</div>
    <p v-else-if="errorMessage" class="mt-8 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      {{ errorMessage }}
    </p>

    <div v-else-if="kit" class="mt-8">
      <div class="grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-10 items-start">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-spark-600 mb-2">{{ kit.categoryName || 'STEM Kit' }}</p>
          <h1 class="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">{{ kit.title }}</h1>
          <div class="flex flex-wrap gap-2 mb-5 text-xs text-slate-600">
            <span v-if="kit.grade" class="rounded-md bg-slate-100 px-2 py-1">{{ kit.grade }}</span>
            <span v-if="kit.price !== null && kit.price !== undefined" class="rounded-md bg-slate-100 px-2 py-1">{{ formatPrice(kit.price) }}</span>
          </div>
          <p class="text-ink-600 leading-relaxed max-w-2xl whitespace-pre-wrap">{{ kit.description }}</p>

          <div class="flex flex-wrap gap-3 mt-7">
            <MarketingButton as="router-link" :to="{ name: 'public-contact' }" variant="primary">
              Enquire About This Kit
            </MarketingButton>
            <a
              v-if="kit.manualPdfUrl"
              :href="kit.manualPdfUrl"
              target="_blank"
              rel="noopener"
              class="inline-flex h-11 items-center justify-center rounded-full border-[1.5px] border-navy-700 px-6 text-sm font-semibold text-navy-700 hover:bg-navy-50 transition"
            >
              Open Manual
            </a>
          </div>
        </div>

        <div>
          <div v-if="activeVideo" class="bg-white rounded-[20px] overflow-hidden shadow-[0px_4px_12px_rgba(31,27,46,0.06)]">
            <div class="aspect-video bg-black">
              <iframe
                class="w-full h-full"
                :src="`https://www.youtube.com/embed/${activeVideo.youtubeVideoId}`"
                :title="activeVideo.title"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
            <div class="p-4">
              <p class="font-display font-medium text-navy-900">{{ activeVideo.title }}</p>
            </div>
          </div>

          <div v-else-if="kit.thumbnailUrl" class="aspect-video rounded-[20px] overflow-hidden bg-lavender-50 shadow-[0px_4px_12px_rgba(31,27,46,0.06)]">
            <img :src="kit.thumbnailUrl" :alt="kit.title" class="w-full h-full object-cover">
          </div>

          <div v-else class="aspect-video rounded-[20px] bg-gradient-to-br from-navy-50 to-spark-50 flex items-center justify-center text-sm text-slate-500">
            No video added yet.
          </div>

          <div v-if="kit.videos && kit.videos.length > 1" class="mt-4 space-y-2">
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Videos</p>
            <button
              v-for="(video, index) in kit.videos"
              :key="video.id || index"
              @click="activeVideoIndex = index"
              class="w-full text-left px-3 py-2.5 rounded-lg text-sm transition flex items-center gap-2"
              :class="index === activeVideoIndex ? 'bg-navy-800 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'"
            >
              <span class="text-xs opacity-60">{{ index + 1 }}.</span>
              <span class="truncate">{{ video.title }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

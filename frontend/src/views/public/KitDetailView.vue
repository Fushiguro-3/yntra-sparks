<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import MarketingButton from '@/components/public/MarketingButton.vue'
import VideoModal from '@/components/VideoModal.vue'
import { publicService } from '@/api/publicService'
import { resolveBackTarget } from '@/utils/kitNavContext'

const props = defineProps({
  id: { type: String, required: true }
})

const route = useRoute()
const kit = ref(null)
const activeVideoIndex = ref(0)
const isLoading = ref(true)
const errorMessage = ref('')
const isVideoOpen = ref(false)

const activeVideo = computed(() => kit.value?.videos?.[activeVideoIndex.value] || null)
const backTarget = computed(() => resolveBackTarget(route.query))

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
    <RouterLink :to="backTarget.to" class="group inline-flex items-center text-sm font-semibold text-navy-700 hover:text-navy-900 transition-colors">
      <span class="inline-block transition-transform duration-200 group-hover:-translate-x-1">&larr;</span>&nbsp;{{ backTarget.label }}
    </RouterLink>

    <div v-if="isLoading" class="mt-8 text-sm text-slate-400">Loading kit...</div>
    <p v-else-if="errorMessage" class="mt-8 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      {{ errorMessage }}
    </p>

    <div v-else-if="kit" class="mt-8">
      <div class="grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-10 items-start">
        <div data-aos="slide-right">
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
          </div>
        </div>

        <div data-aos="slide-left">
          <div v-if="activeVideo" class="group relative aspect-video rounded-[20px] overflow-hidden bg-navy-900 shadow-[0px_4px_12px_rgba(31,27,46,0.06)]">
            <img
              v-if="kit.thumbnailUrl"
              :src="kit.thumbnailUrl"
              :alt="kit.title"
              loading="lazy"
              class="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-300 group-hover:opacity-45"
            >
            <button
              type="button"
              class="absolute inset-0 w-full h-full flex flex-col items-center justify-center gap-3 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-400"
              @click="isVideoOpen = true"
            >
              <span class="w-16 h-16 rounded-full bg-white/90 text-navy-900 flex items-center justify-center text-2xl shadow-lg transition-transform duration-200 group-hover:scale-110" aria-hidden="true">▶</span>
              <span class="font-display font-semibold px-4 text-center">Watch Demo — {{ activeVideo.title }}</span>
            </button>
          </div>

          <div v-else-if="kit.thumbnailUrl" class="group aspect-video rounded-[20px] overflow-hidden bg-lavender-50 shadow-[0px_4px_12px_rgba(31,27,46,0.06)]">
            <img :src="kit.thumbnailUrl" :alt="kit.title" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105">
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

      <VideoModal
        :show="isVideoOpen"
        :video-id="activeVideo?.youtubeVideoId || ''"
        :title="activeVideo?.title || kit.title"
        @close="isVideoOpen = false"
      />
    </div>
  </section>
</template>

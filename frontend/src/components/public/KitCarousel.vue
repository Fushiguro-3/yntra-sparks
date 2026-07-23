<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Reusable arrow-nav carousel for horizontal kit rows (Featured Kits on
// Home, and anywhere else a similar row shows up). Wraps the existing
// scroll-snap pattern rather than replacing it: mouse click (arrows),
// keyboard (arrow keys on the track), touch swipe and trackpad scroll all
// work through the same native `overflow-x-auto` element. No autoplay, no
// infinite loop — arrows simply disable/hide once there's nothing further
// to scroll to.
defineProps({
  ariaLabel: { type: String, default: 'Kits' }
})

const trackRef = ref(null)
const canScrollPrev = ref(false)
const canScrollNext = ref(false)
const progress = ref(0)

function updateState() {
  const el = trackRef.value
  if (!el) return
  const max = el.scrollWidth - el.clientWidth
  canScrollPrev.value = el.scrollLeft > 4
  canScrollNext.value = max > 4 && el.scrollLeft < max - 4
  progress.value = max > 0 ? el.scrollLeft / max : 0
}

function scrollByPage(direction) {
  const el = trackRef.value
  if (!el) return
  el.scrollBy({ left: Math.round(el.clientWidth * 0.85) * direction, behavior: 'smooth' })
}

function handleKeydown(e) {
  if (e.key === 'ArrowRight') {
    e.preventDefault()
    scrollByPage(1)
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault()
    scrollByPage(-1)
  }
}

let resizeObserver
onMounted(() => {
  updateState()
  trackRef.value?.addEventListener('scroll', updateState, { passive: true })
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(updateState)
    if (trackRef.value) resizeObserver.observe(trackRef.value)
  }
  window.addEventListener('resize', updateState)
})
onUnmounted(() => {
  trackRef.value?.removeEventListener('scroll', updateState)
  resizeObserver?.disconnect()
  window.removeEventListener('resize', updateState)
})
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="carousel-arrow hidden sm:flex absolute -left-3 md:-left-5 top-[calc(50%-1rem)] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white items-center justify-center text-navy-800 hover:text-spark-600 shadow-[0_8px_20px_rgba(10,31,77,.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-400"
      :disabled="!canScrollPrev"
      aria-label="Previous kits"
      @click="scrollByPage(-1)"
    >
      <span aria-hidden="true">&larr;</span>
    </button>

    <div
      ref="trackRef"
      class="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-400"
      tabindex="0"
      role="group"
      :aria-label="ariaLabel"
      @keydown="handleKeydown"
    >
      <slot />
    </div>

    <button
      type="button"
      class="carousel-arrow hidden sm:flex absolute -right-3 md:-right-5 top-[calc(50%-1rem)] -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white items-center justify-center text-navy-800 hover:text-spark-600 shadow-[0_8px_20px_rgba(10,31,77,.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-400"
      :disabled="!canScrollNext"
      aria-label="Next kits"
      @click="scrollByPage(1)"
    >
      <span aria-hidden="true">&rarr;</span>
    </button>

    <div class="sm:hidden flex justify-center -mt-2" aria-hidden="true">
      <div class="w-20 h-1 rounded-full bg-navy-100 overflow-hidden">
        <div
          class="h-full bg-spark-500 rounded-full transition-[width] duration-150"
          :style="{ width: `${Math.min(100, Math.max(14, progress * 100))}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

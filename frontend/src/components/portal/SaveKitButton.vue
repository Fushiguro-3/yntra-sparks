<script setup>
import { computed, watch } from 'vue'
import { useSavedKits } from '@/composables/useSavedKits'
import { useToast } from '@/composables/useToast'

// One consistent Save/Unsave control for Teacher and Principal kit cards +
// kit detail. State is communicated through the label text and
// aria-pressed/aria-label, not color alone. Designed to sit as a sibling of
// (not nested inside) a card's RouterLink — see callers for the layout.
const props = defineProps({
  kit: { type: Object, required: true },
  userId: { type: [String, Number], default: null },
  size: { type: String, default: 'md' } // sm | md
})

const { load, isSaved, toggle } = useSavedKits()
const toast = useToast()

// load() is a plain side-effecting call, safe from a watcher — never call
// it from inside the `saved` computed below (see useSavedKits.js).
watch(() => props.userId, load, { immediate: true })

const saved = computed(() => (props.userId ? isSaved(props.kit.id) : false))

function handleClick() {
  if (!props.userId) return
  const nowSaved = toggle(props.userId, props.kit)
  toast.success(nowSaved ? 'Saved to your kits.' : 'Removed from saved kits.')
}
</script>

<template>
  <button
    type="button"
    class="inline-flex items-center gap-1.5 rounded-full font-semibold transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-400"
    :class="[
      size === 'sm' ? 'text-xs px-2.5 py-1.5' : 'text-sm px-3.5 py-2',
      saved ? 'bg-spark-50 text-spark-700 border border-spark-200 hover:bg-spark-100' : 'bg-white text-navy-700 border border-navy-100 hover:border-navy-300'
    ]"
    :aria-pressed="saved"
    :aria-label="saved ? 'Remove from saved kits' : 'Save kit'"
    @click.stop.prevent="handleClick"
  >
    <svg width="14" height="14" viewBox="0 0 20 20" :fill="saved ? 'currentColor' : 'none'" aria-hidden="true">
      <path d="M10 3.5l2.02 4.09 4.52.66-3.27 3.19.77 4.5L10 13.77l-4.04 2.17.77-4.5-3.27-3.19 4.52-.66L10 3.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" />
    </svg>
    <span>{{ saved ? 'Saved' : 'Save kit' }}</span>
  </button>
</template>

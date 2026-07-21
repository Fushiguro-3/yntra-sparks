<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue'

const props = defineProps({
  show: { type: Boolean, default: true },
  title: { type: String, default: '' },
  maxWidth: { type: String, default: 'max-w-md' }
})
const emit = defineEmits(['close'])

const panelRef = ref(null)
const closeButtonRef = ref(null)
let lastFocusedEl = null

function focusableEls() {
  if (!panelRef.value) return []
  return Array.from(
    panelRef.value.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')
  ).filter((el) => el.offsetParent !== null)
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    emit('close')
    return
  }
  if (e.key !== 'Tab') return

  // Simple focus trap: wrap Tab/Shift+Tab within the dialog instead of
  // letting focus escape to the page underneath.
  const els = focusableEls()
  if (els.length === 0) return
  const first = els[0]
  const last = els[els.length - 1]

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault()
    last.focus()
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault()
    first.focus()
  }
}

watch(() => props.show, (isOpen) => {
  if (isOpen) {
    lastFocusedEl = document.activeElement
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeydown)
    nextTick(() => closeButtonRef.value?.focus())
  } else {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', handleKeydown)
    // Return focus to whatever opened the dialog (e.g. the "Edit" button
    // in a table row) rather than leaving it stranded on a removed node.
    lastFocusedEl?.focus?.()
  }
}, { immediate: true })

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Transition name="modal-backdrop">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" :aria-label="title">
      <div class="absolute inset-0 bg-navy-900/55 backdrop-blur-[2px]" @click="emit('close')" />
      <Transition name="modal-panel" appear>
        <div
          ref="panelRef"
          :class="['relative bg-white rounded-[22px] shadow-[0_24px_60px_rgba(10,31,77,.26)] border border-white/70 w-full max-h-[90vh] flex flex-col', maxWidth]"
        >
          <div class="flex items-center justify-between px-6 py-4 border-b border-navy-100 shrink-0 sticky top-0 bg-white rounded-t-[22px]">
            <h2 class="font-display font-bold text-navy-900">{{ title }}</h2>
            <button ref="closeButtonRef" @click="emit('close')" class="w-8 h-8 rounded-full text-slate-400 hover:text-navy-800 hover:bg-navy-50 text-xl leading-none transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-500" aria-label="Close dialog">&times;</button>
          </div>
          <div class="px-6 py-5 overflow-y-auto">
            <slot />
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

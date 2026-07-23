<script setup>
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<template>
  <div
    class="fixed top-4 right-4 z-[70] flex flex-col gap-2 w-[min(22rem,calc(100vw-2rem))]"
    aria-live="polite"
    aria-atomic="false"
  >
    <TransitionGroup name="toast-list" tag="div" class="flex flex-col gap-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        role="status"
        class="app-surface rounded-xl px-4 py-3 flex items-start gap-2.5 shadow-[0_16px_32px_rgba(10,31,77,.16)]"
        :class="toast.type === 'error' ? 'border-red-200 bg-red-50/95' : 'border-navy-100'"
      >
        <span
          class="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
          :class="toast.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-spark-50 text-spark-600'"
          aria-hidden="true"
        >{{ toast.type === 'error' ? '!' : '✓' }}</span>
        <p class="text-sm flex-1" :class="toast.type === 'error' ? 'text-red-700' : 'text-ink-900'">{{ toast.message }}</p>
        <button
          type="button"
          class="text-slate-400 hover:text-navy-800 leading-none text-lg shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-400 rounded"
          aria-label="Dismiss notification"
          @click="dismiss(toast.id)"
        >&times;</button>
      </div>
    </TransitionGroup>
  </div>
</template>

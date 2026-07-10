<script setup>
const props = defineProps({
  page: { type: Number, required: true },       // zero-indexed, current page
  totalPages: { type: Number, required: true }
})
const emit = defineEmits(['change'])
</script>

<template>
  <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 text-sm">
    <button
      class="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
      :disabled="page <= 0"
      @click="emit('change', page - 1)"
    >
      Previous
    </button>
    <span class="text-slate-500">Page {{ page + 1 }} of {{ totalPages }}</span>
    <button
      class="px-3 py-1.5 rounded-lg border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
      :disabled="page >= totalPages - 1"
      @click="emit('change', page + 1)"
    >
      Next
    </button>
  </div>
</template>

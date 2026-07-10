<script setup>
defineProps({
  title: { type: String, default: '' },
  maxWidth: { type: String, default: 'max-w-md' }
})
const emit = defineEmits(['close'])
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-slate-900/50" @click="emit('close')" />
    <div :class="['relative bg-white rounded-2xl shadow-lg w-full', maxWidth]">
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <h2 class="font-display font-semibold text-slate-900">{{ title }}</h2>
        <button @click="emit('close')" class="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
      </div>
      <div class="px-6 py-5">
        <slot />
      </div>
    </div>
  </div>
</template>

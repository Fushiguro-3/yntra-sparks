<script setup>
defineProps({
  show: { type: Boolean, default: true },
  title: { type: String, default: '' },
  maxWidth: { type: String, default: 'max-w-md' }
})
const emit = defineEmits(['close'])
</script>

<template>
  <Transition name="modal-backdrop">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" :aria-label="title">
      <div class="absolute inset-0 bg-navy-900/55 backdrop-blur-[2px]" @click="emit('close')" />
      <Transition name="modal-panel" appear>
        <div :class="['relative bg-white rounded-[22px] shadow-[0_24px_60px_rgba(10,31,77,.26)] border border-white/70 w-full', maxWidth]">
          <div class="flex items-center justify-between px-6 py-4 border-b border-navy-100">
            <h2 class="font-display font-bold text-navy-900">{{ title }}</h2>
            <button @click="emit('close')" class="w-8 h-8 rounded-full text-slate-400 hover:text-navy-800 hover:bg-navy-50 text-xl leading-none transition" aria-label="Close dialog">&times;</button>
          </div>
          <div class="px-6 py-5">
            <slot />
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

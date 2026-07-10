<script setup>
defineProps({
  icon: { type: String, required: true }, // emoji or short glyph for now
  title: { type: String, required: true },
  description: { type: String, required: true }
})
</script>

<template>
  <div class="bg-white rounded-[22px] p-7 kit-card-fun hover:-translate-y-1 transition-all duration-200">
    <div class="w-12 h-12 rounded-2xl bg-spark-50 flex items-center justify-center text-2xl mb-4">
      {{ icon }}
    </div>
    <h3 class="font-display font-medium text-lg text-ink-900 mb-2">{{ title }}</h3>
    <p class="text-sm text-ink-600 leading-relaxed">{{ description }}</p>
  </div>
</template>

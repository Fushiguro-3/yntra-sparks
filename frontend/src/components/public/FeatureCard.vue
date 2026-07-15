<script setup>
defineProps({
  icon: { type: String, default: '' }, // optional emoji/glyph fallback
  image: { type: String, default: '' }, // preferred: real photograph URL
  imageAlt: { type: String, default: '' },
  title: { type: String, required: true },
  description: { type: String, required: true }
})
</script>

<template>
  <div class="bg-white rounded-[22px] p-7 kit-card-fun hover-glow group">
    <div v-if="image" class="w-full h-32 rounded-2xl mb-4 overflow-hidden">
      <img
        :src="image"
        :alt="imageAlt || title"
        loading="lazy"
        class="w-full h-full object-cover transition-transform duration-[760ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.12] group-hover:brightness-[1.03]"
      />
    </div>
    <div v-else class="w-12 h-12 rounded-2xl bg-spark-50 flex items-center justify-center text-2xl mb-4">
      {{ icon }}
    </div>
    <h3 class="font-display font-medium text-lg text-ink-900 mb-2">{{ title }}</h3>
    <p class="text-sm text-ink-600 leading-relaxed">{{ description }}</p>
  </div>
</template>

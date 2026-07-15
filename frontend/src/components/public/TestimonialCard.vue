<script setup>
defineProps({
  quote: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  initials: { type: String, required: true }
})
</script>

<template>
  <div class="bg-lavender-50 rounded-[20px] p-7 testimonial-card">
    <span class="text-spark-500 text-4xl font-display leading-none">"</span>
    <p class="text-ink-900 text-[15px] leading-relaxed mb-6 -mt-2">{{ quote }}</p>
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-full bg-navy-800 text-white flex items-center justify-center text-xs font-semibold shrink-0">
        {{ initials }}
      </div>
      <div>
        <p class="text-sm font-semibold text-ink-900">{{ name }}</p>
        <p class="text-xs text-ink-600">{{ role }}</p>
      </div>
    </div>
  </div>
</template>

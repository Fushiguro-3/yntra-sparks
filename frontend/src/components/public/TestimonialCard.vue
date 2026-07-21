<script setup>
defineProps({
  quote: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  initials: { type: String, required: true }
})
</script>

<template>
  <div class="bg-lavender-50 rounded-[20px] p-7 testimonial-card h-full flex flex-col">
    <span class="text-spark-500 text-4xl font-display leading-none" aria-hidden="true">"</span>
    <p class="text-ink-900 text-[15px] leading-relaxed mb-6 -mt-2 line-clamp-5 flex-1">{{ quote }}</p>
    <div class="flex items-center gap-3 mt-auto">
      <div class="w-10 h-10 rounded-full bg-navy-800 text-white flex items-center justify-center text-xs font-semibold shrink-0">
        {{ initials }}
      </div>
      <div class="min-w-0">
        <p class="text-sm font-semibold text-ink-900 truncate">{{ name }}</p>
        <p class="text-xs text-ink-600 truncate">{{ role }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import MarketingButton from './MarketingButton.vue'

defineProps({
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  ageGroup: { type: String, default: '' },
  duration: { type: String, default: '' },
  emoji: { type: String, default: 'STEM' },
  imageUrl: { type: String, default: '' },
  to: { type: Object, default: () => ({ name: 'public-programs' }) }
})
</script>

<template>
  <div class="w-72 shrink-0 bg-white rounded-[24px] overflow-hidden kit-card-fun hover-glow group">
    <div class="aspect-[16/10] bg-gradient-to-br from-white to-navy-50 flex items-center justify-center text-4xl p-4 relative overflow-hidden">
      <span class="absolute -left-8 top-4 w-20 h-16 orange-splash transition-transform duration-[420ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-110 group-hover:-translate-x-1"></span>
      <span class="absolute -right-8 -bottom-5 w-24 h-20 blue-splash transition-transform duration-[420ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-110 group-hover:translate-x-1"></span>
      <img v-if="imageUrl" :src="imageUrl" :alt="title" class="relative z-10 w-full h-full object-contain transition-transform duration-[420ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.12]">
      <span v-else class="relative z-10 font-display font-bold text-navy-800 text-2xl transition-transform duration-[520ms] ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:scale-110">{{ emoji }}</span>
    </div>
    <div class="p-5">
      <p class="text-xs font-semibold text-spark-600 mb-1">{{ category }}</p>
      <h3 class="font-display font-medium text-ink-900 mb-1.5">{{ title }}</h3>
      <p class="text-sm text-ink-600 mb-3 line-clamp-2">{{ description }}</p>
      <div class="flex gap-1.5 flex-wrap mb-3">
        <span v-if="ageGroup" class="px-2 py-0.5 rounded-full bg-navy-50 text-navy-700 text-[11px] font-semibold">{{ ageGroup }}</span>
        <span v-if="duration" class="px-2 py-0.5 rounded-full bg-navy-50 text-navy-700 text-[11px] font-semibold">{{ duration }}</span>
      </div>
      <MarketingButton as="router-link" :to="to" variant="outline" size="sm" class="w-full">Explore Kit</MarketingButton>
    </div>
  </div>
</template>

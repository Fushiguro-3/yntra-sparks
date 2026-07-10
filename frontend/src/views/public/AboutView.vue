<script setup>
import CtaBanner from '@/components/public/CtaBanner.vue'

const values = [
  { icon: '🤝', label: 'Hands-on first' },
  { icon: '🎯', label: 'Outcomes over hype' },
  { icon: '🧑‍🏫', label: 'Teachers, supported' },
  { icon: '🌱', label: 'Built to grow with a school' }
]
</script>

<template>
  <section class="max-w-[900px] mx-auto px-5 md:px-10 pt-16 pb-20 text-center" data-aos="fade-up">
    <h1 class="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">Our Story</h1>
    <p class="text-lg text-ink-600 leading-relaxed">
      Yntra Sparks began with a simple observation: students remember what they build far longer than what they're told. We set out to make hands-on STEM education something every school could realistically offer — not just the ones with a dedicated lab budget.
    </p>
  </section>

  <section class="bg-white/70 py-16">
    <div class="max-w-[1440px] mx-auto px-5 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-5">
      <div
        v-for="(v, index) in values"
        :key="v.label"
        class="bg-white rounded-[22px] p-6 text-center kit-card-fun"
        data-aos="zoom-pop"
        :style="{ '--aos-delay': `${index * 70}ms` }"
      >
        <p class="text-3xl mb-3">{{ v.icon }}</p>
        <p class="font-display font-medium text-navy-900 text-sm">{{ v.label }}</p>
      </div>
    </div>
  </section>

  <CtaBanner />
</template>

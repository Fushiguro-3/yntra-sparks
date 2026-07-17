<script setup>
import CtaBanner from '@/components/public/CtaBanner.vue'

const storyImage = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80'
const storyImageAlt = 'Students learning together in a STEM classroom'

const values = [
  {
    image: '/images/hands-on.jpg',
    label: 'Hands-on first'
  },
  {
    image: '/images/outcome.jpg',
    label: 'Outcomes over hype'
  },
  {
    image: '/images/teacher.jpg',
    label: 'Teachers, supported'
  },
  {
    image: '/images/school.jpg',
    label: 'Built to grow with a school'
  }
]
</script>

<template>
  <section class="max-w-[900px] mx-auto px-5 md:px-10 pt-16 pb-20 text-center" data-aos="fade-up">
    <h1 class="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">Our Story</h1>
    <p class="text-lg text-ink-600 leading-relaxed">
      Yntra Sparks began with a simple observation: students remember what they build far longer than what they're told. We set out to make hands-on STEM education something every school could realistically offer — not just the ones with a dedicated lab budget.
    </p>
  </section>

  <section class="max-w-[1200px] mx-auto px-5 md:px-10 py-16 grid gap-10 lg:grid-cols-[1.1fr_.9fr] items-center">
    <div data-aos="slide-right" class="rounded-[30px] overflow-hidden shadow-[0_22px_60px_rgba(10,31,77,0.12)] bg-white">
      <img :src="storyImage" :alt="storyImageAlt" class="w-full h-full object-cover" />
    </div>
    <div class="space-y-6" data-aos="slide-left">
      <p class="font-display text-xl text-spark-600 font-semibold">Built for real classrooms</p>
      <p class="text-ink-600 leading-relaxed text-lg">
        Every kit we design is rooted in real classroom practice. From guided lesson pacing to materials that can survive an active middle-school lab, we make sure teachers can focus on learning instead of logistics.
      </p>
      <p class="text-ink-600 leading-relaxed text-lg">
        We believe the best learning happens when students build, test, and improve. That is why our curriculum connects physical experimentation with classroom-ready outcomes, so every lesson is meaningful and memorable.
      </p>
    </div>
  </section>

  <section class="bg-white/70 py-16">
    <div class="max-w-[1440px] mx-auto px-5 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-5">
      <div
        v-for="(v, index) in values"
        :key="v.label"
        class="bg-white rounded-[22px] p-6 text-center kit-card-fun hover-glow hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200"
        data-aos="fade-up"
        :style="{ '--aos-delay': `${index * 130}ms` }"
      >
        <img
  :src="v.image"
  :alt="v.label"
  class="w-20 h-20 mx-auto mb-4 rounded-full object-cover shadow-lg"
/>
        <p class="font-display font-medium text-navy-900 text-sm">{{ v.label }}</p>
      </div>
    </div>
  </section>

  <CtaBanner />
</template>

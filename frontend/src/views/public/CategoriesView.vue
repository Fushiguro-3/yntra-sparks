<script setup>
// Same backend gap noted in HomeView.vue applies here — no public
// GET /api/categories endpoint exists yet, so this is placeholder content
// shaped like the real Category entity. Swap for a real fetch once a
// public endpoint exists.
const categories = [
  { name: 'Science', blurb: 'Experiments that make abstract concepts tangible', emoji: '🔬' },
  { name: 'Technology', blurb: 'Real tools, real interfaces, real confidence', emoji: '💡' },
  { name: 'Engineering', blurb: 'Design, build, test, iterate', emoji: '🌉' },
  { name: 'Mathematics', blurb: 'Numbers made visual and physical', emoji: '📐' },
  { name: 'Coding', blurb: 'From block-based logic to first real code', emoji: '💻' },
  { name: 'Robotics', blurb: 'Assemble, wire, and program working robots', emoji: '🤖' },
  { name: 'Artificial Intelligence', blurb: 'A first, visual look at how machine learning works', emoji: '🧠' }
]
</script>

<template>
  <section class="max-w-[1440px] mx-auto px-5 md:px-10 pt-16 pb-20">
    <div class="text-center mb-12" data-aos="fade-up">
      <h1 class="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-3">Explore by Category</h1>
      <p class="text-ink-600 max-w-lg mx-auto">Every kit belongs to a category — pick one to see what's inside.</p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div
        v-for="(cat, index) in categories"
        :key="cat.name"
        class="bg-white rounded-[24px] p-6 kit-card-fun hover:-translate-y-1 transition-all duration-200"
        data-aos="zoom-pop"
        :style="{ '--aos-delay': `${index * 60}ms` }"
      >
        <p class="text-4xl mb-3">{{ cat.emoji }}</p>
        <h3 class="font-display font-medium text-lg text-navy-900 mb-1">{{ cat.name }}</h3>
        <p class="text-sm text-ink-600">{{ cat.blurb }}</p>
      </div>
    </div>
  </section>
</template>

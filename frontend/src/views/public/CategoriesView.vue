<script setup>
import scienceImage from '@/assets/images/categories/science.svg'
import technologyImage from '@/assets/images/categories/technology.svg'
import engineeringImage from '@/assets/images/categories/engineering.svg'
import mathematicsImage from '@/assets/images/categories/mathematics.svg'
import codingImage from '@/assets/images/categories/coding.svg'
import roboticsImage from '@/assets/images/categories/robotics.svg'
import aiImage from '@/assets/images/categories/artificial-intelligence.svg'

// Same backend gap noted in HomeView.vue applies here — no public
// GET /api/categories endpoint exists yet, so this is placeholder content
// shaped like the real Category entity. Swap for a real fetch once a
// public endpoint exists.
const categories = [
  { name: 'Science', blurb: 'Experiments that make abstract concepts tangible', image: scienceImage, imageAlt: 'Science illustration' },
  { name: 'Technology', blurb: 'Real tools, real interfaces, real confidence', image: technologyImage, imageAlt: 'Technology illustration' },
  { name: 'Engineering', blurb: 'Design, build, test, iterate', image: engineeringImage, imageAlt: 'Engineering illustration' },
  { name: 'Mathematics', blurb: 'Numbers made visual and physical', image: mathematicsImage, imageAlt: 'Mathematics illustration' },
  { name: 'Coding', blurb: 'From block-based logic to first real code', image: codingImage, imageAlt: 'Coding illustration' },
  { name: 'Robotics', blurb: 'Assemble, wire, and program working robots', image: roboticsImage, imageAlt: 'Robotics illustration' },
  { name: 'Artificial Intelligence', blurb: 'A first, visual look at how machine learning works', image: aiImage, imageAlt: 'Artificial intelligence illustration' }
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
        class="group bg-white rounded-[24px] p-6 kit-card-fun hover-glow hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200"
        data-aos="fade-up"
        :style="{ '--aos-delay': `${index * 115}ms` }"
      >
        <div class="w-full aspect-square rounded-[18px] mb-4 overflow-hidden">
          <img
            :src="cat.image"
            :alt="cat.imageAlt"
            loading="lazy"
            class="w-full h-full object-cover transition-transform duration-[760ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.12]"
          />
        </div>
        <h3 class="font-display font-medium text-lg text-navy-900 mb-1">{{ cat.name }}</h3>
        <p class="text-sm text-ink-600">{{ cat.blurb }}</p>
      </div>
    </div>
  </section>
</template>

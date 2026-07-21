<script setup>
import CtaBanner from '@/components/public/CtaBanner.vue'

const storyImage = '/images/about-us.jpeg'
const storyImageAlt = 'Students learning together in a STEM classroom'

const features = [
  {
    icon: '📚',
    title: 'Curriculum Aligned',
    description:
      'Designed to fit classroom lessons and learning objectives.'
  },
  {
    icon: '🧪',
    title: 'Hands-on Learning',
    description:
      'Students learn by building, experimenting, and discovering.'
  },
  {
    icon: '👩‍🏫',
    title: 'Teacher Friendly',
    description:
      'Easy to set up and simple to conduct in regular classrooms.'
  },
  {
    icon: '♻️',
    title: 'Reusable Kits',
    description:
      'Built for repeated classroom use with durable components.'
  }
]
const team = [
  {
    name: 'Vikas Singh',
    role: 'Founder',
    description:
      'Focused on product development and innovative design to create practical STEM kits that make learning delightful and effective.',
    linkedin: 'https://linkedin.com/in/vikas-singh-0b9b34381',
    image: '/images/team/vikas-kumar.jpeg'
  },
  {
    name: 'Kush Kumar',
    role: 'Co-Founder',
    description:
      'Passionate about making STEM education engaging and accessible through innovative, hands-on learning solutions for every classroom.',
    linkedin: 'https://linkedin.com/in/kush-kumar-1095ab379',
    image: '/images/team/kush-kumar.jpeg'
  },
  {
    name: 'Dhanashri Bende',
    role: 'Co-Founder',
    description:
      'Dedicated to curriculum alignment and enhancing classroom experiences through engaging, student-friendly STEM activities.',
    linkedin: 'https://linkedin.com/in/dhanashri-bende-6a30b8382',
    image: '/images/team/dhanashri.jpeg'
  }
]
</script>

<template>
  <section class="max-w-[900px] mx-auto px-5 md:px-10 pt-16 pb-20 text-center" data-aos="fade-up">
    <h1 class="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-4">Our Story</h1>
    <p class="text-lg text-ink-600 leading-relaxed">
     Every child is naturally curious. They love asking questions, exploring, and learning by doing.
But in many classrooms, science is still taught mainly through textbooks. We wanted to change that.
That's why we started Yntra Sparks—to create affordable, curriculum-aligned STEM kits that help students learn by building, experimenting, and discovering.
    </p>
  </section>

  <section class="max-w-[1200px] mx-auto px-5 md:px-10 py-16 grid gap-10 lg:grid-cols-[1.1fr_.9fr] items-center">
    <div data-aos="slide-right" class="rounded-[30px] overflow-hidden shadow-[0_22px_60px_rgba(10,31,77,0.12)] bg-white">
      <img :src="storyImage" :alt="storyImageAlt" class="w-full h-full object-cover" />
    </div>
    <div class="space-y-6" data-aos="slide-left">
      <p class="font-display text-xl text-spark-600 font-semibold">Designed for Every Classroom</p>
      <p class="text-ink-600 leading-relaxed text-lg">
        Every Yntra Sparks kit is created with real classrooms in mind. 
They are easy for teachers to use, simple for students to understand, and aligned with the school curriculum. 
Each activity is carefully designed to fit naturally into classroom lessons, making learning both practical and engaging.
      </p>
      <p class="text-ink-600 leading-relaxed text-lg">
        Our goal is to make science more interactive through hands-on activities that encourage students to explore, build, experiment, and learn with confidence. 
By turning classroom concepts into real experiences, we help students develop curiosity, creativity, problem-solving skills, and a deeper understanding of the world around them.
      </p>
    </div>
  </section>

  <section class="bg-white py-20">
  <div class="max-w-[1200px] mx-auto px-5 md:px-10">

    <div class="text-center mb-14" data-aos="fade-up">
      <h2 class="font-display text-3xl md:text-4xl font-bold text-navy-900">
        Why Schools Choose Yntra Sparks
      </h2>

      <p class="mt-4 text-lg text-ink-600 max-w-2xl mx-auto">
        Discover what makes our STEM kits an effective and trusted choice for classrooms.
      </p>
    </div>

    <div class="grid md:grid-cols-2 gap-8">

      <div
        v-for="(feature, index) in features"
        :key="feature.title"
        class="bg-white rounded-[24px] p-8 shadow-lg border border-gray-100 hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
        data-aos="fade-up"
        :style="{ '--aos-delay': `${index * 45}ms` }"
      >

        <div class="text-5xl mb-5">
          {{ feature.icon }}
        </div>

        <h3 class="font-display text-2xl font-semibold text-navy-900 mb-3">
          {{ feature.title }}
        </h3>

        <p class="text-ink-600 leading-relaxed">
          {{ feature.description }}
        </p>

      </div>

    </div>

  </div>
</section>
<section class="py-20 bg-slate-50">
  <div class="max-w-[1200px] mx-auto px-5 md:px-10">

    <div class="text-center mb-14" data-aos="fade-up">
      <h2 class="font-display text-3xl md:text-4xl font-bold text-navy-900">
        Meet the Team
      </h2>

      <p class="mt-4 text-lg text-ink-600">
        Meet the People behind Yntra Sparks
      </p>
    </div>

    <div class="grid md:grid-cols-3 gap-8">

      <div
        v-for="(member, index) in team"
        :key="member.name"
        class="bg-white rounded-[24px] shadow-lg overflow-hidden hover:-translate-y-2 hover:shadow-xl transition-all duration-300"
        data-aos="fade-up"
        :style="{ '--aos-delay': `${index * 45}ms` }"
      >

        <img
          :src="member.image"
          :alt="member.name"
          class="w-full h-72 object-cover"
        />

        <div class="p-6">

          <h3 class="font-display text-2xl font-semibold text-navy-900">
            {{ member.name }}
          </h3>

          <p class="text-spark-600 font-medium mb-4">
            {{ member.role }}
          </p>

          <p class="text-ink-600 leading-relaxed mb-6">
            {{ member.description }}
          </p>

          <a
            :href="member.linkedin"
            target="_blank"
            class="inline-flex items-center text-spark-600 font-medium hover:underline"
          >
            LinkedIn →
          </a>

        </div>

      </div>

    </div>

  </div>
</section>
<section class="py-20 bg-slate-50">
  <div class="max-w-[1100px] mx-auto px-5 md:px-10">

    <div class="text-center mb-12" data-aos="fade-up">
      <h2 class="font-display text-3xl md:text-4xl font-bold text-navy-900">
        Recognition & Support
      </h2>

    </div>

    <div
      class="bg-white rounded-[24px] p-8 md:p-10 shadow-lg border border-gray-100 flex flex-col md:flex-row items-center gap-8"
      data-aos="fade-up"
    >

      <!-- Logo Placeholder -->
      <img
  src="/images/partners/idrp.jpg"
  alt="IIIT Dharwad"
  class="w-40 h-40 object-contain"
/>

      <!-- Content -->
      <div class="flex-1">
        <h3 class="font-display text-2xl font-semibold text-navy-900 mb-4">
          Innovation & Research Development Program (IDRP)
        </h3>

        <p class="text-ink-600 leading-relaxed">
Proudly supported by IIIT Dharwad Research Park (IDRP) through the Innovation & Development Program – Yuva Udhyami 2025, empowering us to transform our vision of hands-on STEM education into meaningful classroom experiences for students across India.
        </p>
      </div>

    </div>

  </div>
</section>
  <CtaBanner />
</template>

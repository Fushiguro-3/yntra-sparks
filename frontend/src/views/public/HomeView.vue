<script setup>

import { computed, ref, onMounted, onUnmounted } from 'vue'
import MarketingButton from '@/components/public/MarketingButton.vue'
import FeatureCard from '@/components/public/FeatureCard.vue'
import MarketingKitCard from '@/components/public/MarketingKitCard.vue'
import KitCarousel from '@/components/public/KitCarousel.vue'
import TestimonialMarquee from '@/components/public/TestimonialMarquee.vue'
import CtaBanner from '@/components/public/CtaBanner.vue'
import FloatingBubbles from '@/components/public/FloatingBubbles.vue'
import { publicService } from '@/api/publicService'
import { categoryService } from '@/api/categoryService'
import { heroReveal, heroVisualReveal, attachCursorParallax } from '@/utils/motion'
import { imageForCategory } from '@/utils/categoryImages'
import { blurbForCategory } from '@/utils/categoryBlurbs'
import { buildKitContext } from '@/utils/kitNavContext'

const heroEyebrow = ref(null)
const heroHeading = ref(null)
const heroCopy = ref(null)
const heroActions = ref(null)
const heroVisual = ref(null)

const features = [
  {
    image: 'https://images.unsplash.com/photo-1758685734030-a31d96462eec?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'A teacher and student working hands-on with materials in a classroom',
    title: 'Hands-on kits',
    description: 'Every lesson ships with real, tactile materials — not just a worksheet and a video link.'
  },
  {
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'Students in a classroom following an aligned lesson with their teacher',
    title: 'Curriculum-aligned',
    description: 'Built around what schools already teach, so kits slot into existing lesson plans.'
  },
  {
    image: 'https://images.unsplash.com/photo-1758270704925-fa59d93119c1?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'A teacher guiding students through a lesson',
    title: 'Teacher support',
    description: 'Every kit comes with guided video lessons teachers can lean on, no separate training required.'
  },
  {
    image: 'https://images.unsplash.com/photo-1758270704286-83476deb3bd1?auto=format&fit=crop&w=600&q=80',
    imageAlt: 'A student presenting their work to the class',
    title: 'Measurable outcomes',
    description: 'Clear learning outcomes per kit, so schools can see what students actually gained.'
  }
]

const featuredKits = [
  { title: 'Circuit Explorers', category: 'Electronics', description: 'Build working circuits from scratch using breadboards and real components.', ageGroup: 'Ages 8–11', duration: '6 sessions', imageUrl: 'https://images.unsplash.com/photo-1613271752699-ede48a285196?auto=format&fit=crop&w=600&q=80' },
  { title: 'Robo Starter Kit', category: 'Robotics', description: 'Assemble and program a simple line-following robot step by step.', ageGroup: 'Ages 10–13', duration: '8 sessions', imageUrl: 'https://images.unsplash.com/photo-1518792528501-352f829886dc?auto=format&fit=crop&w=600&q=80' },
  { title: 'Code Sprouts', category: 'Coding', description: 'A block-based intro to programming logic through fun mini-games.', ageGroup: 'Ages 7–10', duration: '5 sessions', imageUrl: 'https://images.unsplash.com/photo-1536148935331-408321065b18?auto=format&fit=crop&w=600&q=80' },
  { title: 'Bridge Builders', category: 'Engineering', description: 'Design and stress-test model bridges to learn core engineering principles.', ageGroup: 'Ages 11–14', duration: '4 sessions', imageUrl: 'https://images.unsplash.com/photo-1758685734153-132c8620c1bd?auto=format&fit=crop&w=600&q=80' },
  { title: 'AI for Beginners', category: 'Artificial Intelligence', description: 'A gentle, visual introduction to how machine learning actually works.', ageGroup: 'Ages 12–15', duration: '6 sessions', imageUrl: 'https://images.unsplash.com/photo-1599666527768-e8cf85741436?auto=format&fit=crop&w=600&q=80' }
]

const publicFeaturedKits = ref([])
const featuredKitCards = computed(() => {
  if (publicFeaturedKits.value.length === 0) return featuredKits

  return publicFeaturedKits.value.slice(0, 6).map((kit) => ({
    title: kit.title,
    category: kit.categoryName || 'STEM Kit',
    description: kit.description || '',
    ageGroup: kit.grade || '',
    duration: kit.videos?.length ? `${kit.videos.length} video${kit.videos.length === 1 ? '' : 's'}` : '',
    emoji: 'STEM',
    imageUrl: kit.thumbnailUrl || '',
    to: { name: 'public-kit-detail', params: { id: kit.id }, query: buildKitContext('home') }
  }))
})

// Categories are read live from categoryService — the same source Super
// Admin's Categories page writes through — rather than a hardcoded list, so
// a category added/renamed/removed there shows up here too.
const categories = ref([])
const categoryCards = computed(() => categories.value.map((cat) => ({
  id: cat.id,
  name: cat.name,
  blurb: blurbForCategory(cat.name),
  image: imageForCategory(cat.name),
  imageAlt: `${cat.name} illustration`,
  kitCount: publicFeaturedKits.value.filter((k) => k.categoryId === cat.id).length
})))

const testimonials = [
  { quote: 'Our students went from watching science to actually doing it. The engagement shift was immediate.', name: 'Anita Rao', role: 'Principal, Greenview School', initials: 'AR' },
  { quote: "Every kit comes with everything I need to teach it well — I don't have to build lesson plans from scratch anymore.", name: 'Deepak Menon', role: 'STEM Teacher', initials: 'DM' },
  { quote: 'The measurable outcomes made it easy to show our board this was worth the investment.', name: 'Fatima Sheikh', role: 'Academic Coordinator', initials: 'FS' }
]



async function loadFeaturedKits() {
  try {
    const res = await publicService.listKits({ size: 100 })
    publicFeaturedKits.value = res.content || []
  } catch {
    publicFeaturedKits.value = []
  }
}

async function loadCategories() {
  try {
    categories.value = await categoryService.list()
  } catch {
    categories.value = []
  }
}

let detachParallax = () => {}

onMounted(() => {
  loadFeaturedKits()
  loadCategories()
  heroReveal([heroEyebrow.value, heroCopy.value, heroActions.value], heroHeading.value)
  heroVisualReveal(heroVisual.value)
  detachParallax = attachCursorParallax(heroVisual.value, { strength: 6 })
})
onUnmounted(() => {
  detachParallax()
})

function scrollToContent() {
  window.scrollBy({ top: window.innerHeight * 0.72, behavior: 'smooth' })
}
</script>

<template>
  <!-- Hero -->
  <section class="max-w-[1440px] mx-auto px-5 md:px-10 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative" data-aos="fade-up">
    <FloatingBubbles density="full" />
    <span class="absolute left-[8%] top-8 w-20 h-10 blue-splash opacity-80 hidden md:block" data-aos="fade-in"></span>
    <span class="absolute right-[12%] bottom-10 w-16 h-16 orange-splash opacity-90 hidden md:block" data-aos="fade-in"></span>
    <div class="relative z-10">
      <p ref="heroEyebrow" class="inline-flex splash-chip text-xs font-bold uppercase text-navy-800 mb-4">STEM kits for curious classrooms</p>
      <h1 ref="heroHeading" class="font-display font-bold text-4xl md:text-[56px] md:leading-[64px] text-navy-900 mb-5">
        Where curiosity becomes capability
      </h1>
      <p ref="heroCopy" class="text-lg text-ink-600 leading-relaxed mb-8 max-w-md">
        Hands-on STEM kits, built for real classrooms — curriculum-aligned, teacher-supported, and genuinely fun to teach.
      </p>
      <div ref="heroActions" class="flex flex-wrap gap-3" :style="{ '--aos-delay': '120ms' }">
        <MarketingButton as="router-link" :to="{ name: 'public-categories' }" variant="primary" size="lg">
          Explore Categories
        </MarketingButton>
        <MarketingButton as="router-link" :to="{ name: 'public-programs' }" variant="ghost" size="lg">
          View Programs
        </MarketingButton>
      </div>
    </div>
    <div ref="heroVisual" class="relative z-10 flex items-center justify-center" :style="{ '--aos-delay': '140ms' }">
      <div class="w-full max-w-sm aspect-square rounded-[36px] bg-white flex items-center justify-center animate-float kit-card-fun relative overflow-hidden">
        <span class="absolute -left-12 bottom-8 w-36 h-28 blue-splash"></span>
        <span class="absolute -right-12 top-8 w-36 h-28 orange-splash"></span>
        <img src="@/assets/logo.png" alt="Yntra Sparks" class="relative z-10 w-40 h-40" />
      </div>
      <div class="absolute -bottom-4 -left-4 bg-white/70 backdrop-blur-xl border border-line-200 rounded-2xl px-5 py-3 shadow-[0px_12px_28px_rgba(10,31,77,0.12)]" data-aos="fade-up" :style="{ '--aos-delay': '160ms' }">
        <p class="font-display font-bold text-navy-800 text-xl leading-none">6+</p>
        <p class="text-xs text-ink-600 mt-1">STEM categories</p>
      </div>
    </div>

    <button
      type="button"
      class="scroll-indicator absolute left-1/2 -bottom-2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-1.5 text-spark-600/80 hover:text-spark-600 z-10"
      aria-label="Scroll to explore"
      @click="scrollToContent"
    >
      <span class="text-[11px] font-semibold uppercase tracking-[.16em]">Scroll</span>
      <svg width="18" height="28" viewBox="0 0 18 28" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="16" height="26" rx="8" stroke="currentColor" stroke-width="1.5"/>
        <circle cx="9" cy="8" r="2" fill="currentColor"/>
      </svg>
    </button>
  </section>


  <!-- Why Yntra Sparks -->
  <section class="max-w-[1440px] mx-auto px-5 md:px-10 py-16">
    <h2 class="font-display text-2xl md:text-3xl font-semibold text-navy-900 mb-10 text-center" data-aos="fade-up">Why Yntra Sparks</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <FeatureCard
        v-for="(f, index) in features"
        :key="f.title"
        v-bind="f"
        data-aos="zoom-pop"
        :style="{ '--aos-delay': `${index * 45}ms` }"
      />
    </div>
  </section>

  <!-- Featured Kits -->
  <section class="py-16 bg-white/70">
    <div class="max-w-[1440px] mx-auto px-5 md:px-10">
      <div class="flex items-end justify-between mb-8" data-aos="fade-up">
        <h2 class="font-display text-2xl md:text-3xl font-semibold text-navy-900">Featured STEM Kits</h2>
        <RouterLink :to="{ name: 'public-programs' }" class="text-sm font-semibold text-navy-700 hover:text-navy-900 hidden sm:block">
          View all &rarr;
        </RouterLink>
      </div>
    </div>
    <div class="max-w-[1440px] mx-auto px-5 md:px-10">
      <KitCarousel aria-label="Featured STEM Kits">
        <div
          v-for="(kit, index) in featuredKitCards"
          :key="kit.to?.params?.id || `${kit.title}-${index}`"
          class="snap-start h-full"
          data-aos="fade-up"
          :style="{ '--aos-delay': `${index * 40}ms` }"
        >
          <MarketingKitCard v-bind="kit" />
        </div>
      </KitCarousel>
    </div>
  </section>

  <!-- Categories -->
  <section class="max-w-[1440px] mx-auto px-5 md:px-10 py-16">
    <h2 class="font-display text-2xl md:text-3xl font-semibold text-navy-900 mb-10 text-center" data-aos="fade-up">Explore by Category</h2>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <RouterLink
        v-for="(cat, index) in categoryCards"
        :key="cat.id"
        :to="{ name: 'public-categories', query: { category: cat.id } }"
        class="group bg-white rounded-[22px] p-5 text-center kit-card-fun hover-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-400"
        data-aos="zoom-pop"
        :style="{ '--aos-delay': `${index * 35}ms` }"
      >
        <div class="w-full aspect-square rounded-2xl mb-3 overflow-hidden">
          <img
            :src="cat.image"
            :alt="cat.imageAlt"
            loading="lazy"
            class="w-full h-full object-cover transition-transform duration-[420ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.12]"
          />
        </div>
        <p class="font-display font-medium text-navy-900 mb-1">{{ cat.name }}</p>
        <p class="text-xs text-ink-600 line-clamp-2">{{ cat.blurb }}</p>
        <p v-if="cat.kitCount > 0" class="text-[11px] font-semibold text-spark-600 mt-1.5">{{ cat.kitCount }} kit{{ cat.kitCount === 1 ? '' : 's' }}</p>
      </RouterLink>
    </div>
  </section>

  <!-- Testimonials -->
  <section class="py-16 bg-white/70 overflow-hidden">
    <div class="max-w-[1440px] mx-auto px-5 md:px-10">
      <h2 class="font-display text-2xl md:text-3xl font-semibold text-navy-900 mb-10 text-center" data-aos="fade-up">What Schools Are Saying</h2>
    </div>
    <TestimonialMarquee :testimonials="testimonials" />
  </section>

  <!-- About preview -->
  <section class="max-w-[1440px] mx-auto px-5 md:px-10 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    <div class="order-2 lg:order-1 aspect-video rounded-[28px] bg-white kit-card-fun group relative overflow-hidden" data-aos="slide-right">
      <span class="absolute -left-10 -bottom-8 w-32 h-28 blue-splash z-0"></span>
      <span class="absolute -right-8 top-8 w-28 h-24 orange-splash z-0"></span>
      <img
        src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=900&q=80"
        alt="Children learning together in a classroom"
        loading="lazy"
        class="relative z-10 w-full h-full object-cover transition-transform duration-[420ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.08]"
      />
    </div>
    <div class="order-1 lg:order-2" data-aos="slide-left">
      <h2 class="font-display text-2xl md:text-3xl font-semibold text-navy-900 mb-4">Built by people who care how kids learn</h2>
      <p class="text-ink-600 leading-relaxed mb-6">
        Yntra Sparks started with a simple idea: STEM education sticks best when students build something with their own hands. Every kit we ship is designed around that belief.
      </p>
      <RouterLink :to="{ name: 'public-about' }" class="text-sm font-semibold text-navy-700 hover:text-navy-900">
        Read our story &rarr;
      </RouterLink>
    </div>
  </section>

  <CtaBanner />
</template>

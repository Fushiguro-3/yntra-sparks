<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const navRef = ref(null)
const sliderStyle = ref({ opacity: 0, width: '0px', transform: 'translateX(0px)' })
const hasMounted = ref(false)

const navLinks = [
  { label: 'Home', to: { name: 'public-home' } },
  { label: 'About Us', to: { name: 'public-about' } },
  { label: 'Categories', to: { name: 'public-categories' } }
]

const secondaryNavLinks = [
  { label: 'Programs', to: { name: 'public-programs' } },
  { label: 'Contact', to: { name: 'public-contact' } }
]

const gradeLinks = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8']

function handleScroll() {
  isScrolled.value = window.scrollY > 40
}

// A single shared highlight that glides beneath whichever link is being
// hovered, rather than each link animating its own underline in isolation —
// this is what makes the nav read as "one living system" instead of six
// separate hover effects firing independently.
function moveSlider(event) {
  const el = event.currentTarget
  const navEl = navRef.value
  if (!el || !navEl) return
  const elRect = el.getBoundingClientRect()
  const navRect = navEl.getBoundingClientRect()
  sliderStyle.value = {
    opacity: 1,
    width: `${elRect.width}px`,
    transform: `translateX(${elRect.left - navRect.left}px)`
  }
}
function resetSlider() {
  sliderStyle.value = { ...sliderStyle.value, opacity: 0 }
}

onMounted(() => {
  hasMounted.value = true
  window.addEventListener('scroll', handleScroll, { passive: true })
})
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <header
    class="sticky top-0 z-40 transition-[background-color,border-color,height,box-shadow] duration-[520ms] ease-[cubic-bezier(.16,1,.3,1)] nav-shadow"
    :class="[
      isScrolled
        ? 'bg-white/70 backdrop-blur-xl border-b border-line-200 h-[68px]'
        : 'bg-transparent border-b border-transparent h-20',
      { 'nav-shadow-active': isScrolled, 'header-enter': hasMounted }
    ]"
  >
    <div class="max-w-[1440px] mx-auto h-full px-5 md:px-10 flex items-center justify-between">
      <RouterLink :to="{ name: 'public-home' }" class="flex items-center gap-2 group">
        <img
          src="@/assets/logo.png"
          alt="Yntra Sparks"
          class="w-9 h-9 transition-transform duration-[520ms] ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:rotate-[-10deg] group-hover:scale-[1.14] group-active:scale-[0.94] group-active:duration-100"
        />
        <span class="font-display font-bold text-navy-900 hidden sm:inline transition-colors duration-200 group-hover:text-spark-600">Yntra Sparks</span>
      </RouterLink>

      <nav ref="navRef" class="hidden lg:flex items-center gap-8 relative" @mouseleave="resetSlider">
        <!-- Shared sliding highlight — tracks whichever link is hovered with a
             premium expo-out glide instead of each link handling its own hover
             independently. -->
        <span
          class="nav-slider"
          :style="{ opacity: sliderStyle.opacity, width: sliderStyle.width, transform: sliderStyle.transform }"
          aria-hidden="true"
        ></span>

        <RouterLink
          v-for="link in navLinks"
          :key="link.label"
          :to="link.to"
          class="nav-link text-sm font-medium text-ink-900/80 hover:text-navy-700 relative py-1.5 px-1 transition-colors duration-200
                 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-full after:bg-spark-500
                 after:origin-center after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-[420ms] after:ease-[cubic-bezier(.16,1,.3,1)]"
          active-class="text-navy-800 after:scale-x-100"
          @mouseenter="moveSlider"
        >
          {{ link.label }}
        </RouterLink>
        <div class="relative group py-1.5">
          <button
            class="nav-link text-sm font-medium text-ink-900/80 hover:text-navy-700 relative px-1 transition-colors duration-200"
            @mouseenter="moveSlider"
          >
            Grades
            <svg class="inline-block w-3 h-3 ml-1 -mt-0.5 transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] group-hover:rotate-180" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          <div class="absolute left-1/2 top-full w-44 -translate-x-1/2 pt-3 grades-menu">
            <div class="rounded-xl border border-line-200 bg-white p-2 shadow-[0px_18px_36px_rgba(10,31,77,0.16)]">
              <RouterLink
                v-for="(grade, i) in gradeLinks"
                :key="grade"
                :to="{ name: 'public-grades', query: { grade } }"
                class="block rounded-lg px-3 py-2 text-sm text-ink-700 transition-[background-color,transform] duration-200 ease-[cubic-bezier(.16,1,.3,1)] hover:bg-lavender-50 hover:text-navy-800 hover:translate-x-1"
                :style="{ transitionDelay: `${i * 15}ms` }"
              >
                {{ grade }}
              </RouterLink>
            </div>
          </div>
        </div>
        <RouterLink
          v-for="link in secondaryNavLinks"
          :key="link.label"
          :to="link.to"
          class="nav-link text-sm font-medium text-ink-900/80 hover:text-navy-700 relative py-1.5 px-1 transition-colors duration-200
                 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:w-full after:bg-spark-500
                 after:origin-center after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-[420ms] after:ease-[cubic-bezier(.16,1,.3,1)]"
          active-class="text-navy-800 after:scale-x-100"
          @mouseenter="moveSlider"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="hidden lg:flex items-center gap-3">
        <RouterLink
          :to="{ name: 'login' }"
          class="px-5 py-2.5 rounded-full text-sm font-semibold text-navy-700 transition-[background-color,transform] duration-[360ms] ease-[cubic-bezier(.16,1,.3,1)] hover:bg-navy-50 hover:scale-[1.05] active:scale-[0.95] active:duration-100"
        >
          Login
        </RouterLink>
        <RouterLink
          :to="{ name: 'public-contact' }"
          class="relative overflow-hidden mkt-btn-shine px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-navy-800 transition-[background-color,transform,box-shadow] duration-[360ms] ease-[cubic-bezier(.16,1,.3,1)] hover:bg-navy-900 hover:scale-[1.05] active:scale-[0.95] active:duration-100 shadow-[0px_4px_12px_rgba(10,31,77,0.2)] hover:shadow-[0px_14px_26px_rgba(10,31,77,0.32)]"
        >
          Get in touch
        </RouterLink>
      </div>

      <button
        class="lg:hidden w-10 h-10 flex flex-col items-center justify-center gap-[5px] rounded-lg text-navy-800 active:scale-90 transition-transform duration-150"
        @click="isMobileMenuOpen = true"
        aria-label="Open menu"
      >
        <span class="hamburger-bar" :class="isMobileMenuOpen ? 'translate-y-[7px] rotate-45' : ''"></span>
        <span class="hamburger-bar" :class="isMobileMenuOpen ? 'opacity-0 scale-x-0' : ''"></span>
        <span class="hamburger-bar" :class="isMobileMenuOpen ? '-translate-y-[7px] -rotate-45' : ''"></span>
      </button>
    </div>
  </header>

  <!-- Mobile drawer -->
  <Transition
    enter-active-class="transition duration-[420ms] ease-[cubic-bezier(.16,1,.3,1)]"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-[220ms] ease-[cubic-bezier(.7,0,.84,0)]"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isMobileMenuOpen" class="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-[2px]" @click="isMobileMenuOpen = false" />
  </Transition>
  <Transition
    enter-active-class="transition-transform duration-[520ms] ease-[cubic-bezier(.16,1,.3,1)]"
    enter-from-class="translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition-transform duration-[260ms] ease-[cubic-bezier(.7,0,.84,0)]"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-full"
  >
    <div v-if="isMobileMenuOpen" class="fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-[0px_24px_48px_rgba(31,27,46,0.14)] p-6 flex flex-col">
      <div class="flex justify-between items-center mb-8">
        <img src="@/assets/logo.png" alt="Yntra Sparks" class="w-8 h-8" />
        <button @click="isMobileMenuOpen = false" class="text-2xl text-ink-600 leading-none transition-transform duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] hover:rotate-90 hover:text-navy-800" aria-label="Close menu">&times;</button>
      </div>
      <nav class="flex flex-col gap-1">
        <RouterLink
          v-for="(link, i) in navLinks"
          :key="link.label"
          :to="link.to"
          @click="isMobileMenuOpen = false"
          class="drawer-item px-3 py-3 rounded-lg text-sm font-medium text-ink-900 transition-[background-color,transform] duration-200 ease-[cubic-bezier(.16,1,.3,1)] hover:bg-lavender-50 hover:translate-x-1.5 active:scale-[0.97]"
          :style="{ transitionDelay: `${i * 30}ms` }"
        >
          {{ link.label }}
        </RouterLink>
        <p class="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Grades</p>
        <RouterLink
          v-for="grade in gradeLinks"
          :key="grade"
          :to="{ name: 'public-grades', query: { grade } }"
          @click="isMobileMenuOpen = false"
          class="px-3 py-2 rounded-lg text-sm font-medium text-ink-900 transition-[background-color,transform] duration-200 ease-[cubic-bezier(.16,1,.3,1)] hover:bg-lavender-50 hover:translate-x-1.5"
        >
          {{ grade }}
        </RouterLink>
        <RouterLink
          v-for="link in secondaryNavLinks"
          :key="link.label"
          :to="link.to"
          @click="isMobileMenuOpen = false"
          class="px-3 py-3 rounded-lg text-sm font-medium text-ink-900 transition-[background-color,transform] duration-200 ease-[cubic-bezier(.16,1,.3,1)] hover:bg-lavender-50 hover:translate-x-1.5"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
      <div class="mt-auto flex flex-col gap-2">
        <RouterLink :to="{ name: 'login' }" @click="isMobileMenuOpen = false" class="px-4 py-2.5 rounded-full text-sm font-semibold text-navy-700 border border-navy-200 text-center transition-[transform,background-color] duration-200 ease-[cubic-bezier(.16,1,.3,1)] hover:bg-navy-50 active:scale-[0.96]">
          Login
        </RouterLink>
        <RouterLink :to="{ name: 'public-contact' }" @click="isMobileMenuOpen = false" class="relative overflow-hidden mkt-btn-shine px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-navy-800 text-center transition-transform duration-200 ease-[cubic-bezier(.16,1,.3,1)] active:scale-[0.96]">
          Get in touch
        </RouterLink>
      </div>
    </div>
  </Transition>
</template>

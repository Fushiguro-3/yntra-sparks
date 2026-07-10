<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

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

onMounted(() => window.addEventListener('scroll', handleScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', handleScroll))
</script>

<template>
  <header
    class="sticky top-0 z-40 transition-all duration-200"
    :class="isScrolled
      ? 'bg-white/70 backdrop-blur-xl border-b border-line-200 h-[68px]'
      : 'bg-transparent border-b border-transparent h-20'"
  >
    <div class="max-w-[1440px] mx-auto h-full px-5 md:px-10 flex items-center justify-between">
      <RouterLink :to="{ name: 'public-home' }" class="flex items-center gap-2">
        <img src="@/assets/logo.png" alt="Yntra Sparks" class="w-9 h-9" />
        <span class="font-display font-bold text-navy-900 hidden sm:inline">Yntra Sparks</span>
      </RouterLink>

      <nav class="hidden lg:flex items-center gap-8">
        <RouterLink
          v-for="link in navLinks"
          :key="link.label"
          :to="link.to"
          class="text-sm font-medium text-ink-900/80 hover:text-navy-700 relative py-1 transition-colors
                 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:bg-spark-500
                 after:w-0 hover:after:w-full after:transition-all after:duration-200"
          active-class="text-navy-800 after:w-full"
        >
          {{ link.label }}
        </RouterLink>
        <div class="relative group py-1">
          <button class="text-sm font-medium text-ink-900/80 hover:text-navy-700 transition-colors">
            Grades
          </button>
          <div class="absolute left-1/2 top-full hidden w-44 -translate-x-1/2 pt-3 group-hover:block">
            <div class="rounded-xl border border-line-200 bg-white p-2 shadow-[0px_12px_28px_rgba(10,31,77,0.12)]">
              <RouterLink
                v-for="grade in gradeLinks"
                :key="grade"
                :to="{ name: 'public-grades', query: { grade } }"
                class="block rounded-lg px-3 py-2 text-sm text-ink-700 hover:bg-lavender-50 hover:text-navy-800"
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
          class="text-sm font-medium text-ink-900/80 hover:text-navy-700 relative py-1 transition-colors
                 after:content-[''] after:absolute after:left-0 after:-bottom-0.5 after:h-0.5 after:bg-spark-500
                 after:w-0 hover:after:w-full after:transition-all after:duration-200"
          active-class="text-navy-800 after:w-full"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="hidden lg:flex items-center gap-3">
        <RouterLink
          :to="{ name: 'login' }"
          class="px-5 py-2.5 rounded-full text-sm font-semibold text-navy-700 hover:bg-navy-50 transition"
        >
          Login
        </RouterLink>
        <RouterLink
          :to="{ name: 'public-contact' }"
          class="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-navy-800 hover:bg-navy-900 transition shadow-[0px_4px_12px_rgba(10,31,77,0.2)]"
        >
          Get in touch
        </RouterLink>
      </div>

      <button
        class="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-navy-800"
        @click="isMobileMenuOpen = true"
        aria-label="Open menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>
      </button>
    </div>
  </header>

  <!-- Mobile drawer -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isMobileMenuOpen" class="fixed inset-0 z-50 bg-ink-900/40" @click="isMobileMenuOpen = false" />
  </Transition>
  <Transition
    enter-active-class="transition duration-[260ms] ease-out"
    enter-from-class="translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-full"
  >
    <div v-if="isMobileMenuOpen" class="fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-[0px_24px_48px_rgba(31,27,46,0.14)] p-6 flex flex-col">
      <div class="flex justify-between items-center mb-8">
        <img src="@/assets/logo.png" alt="Yntra Sparks" class="w-8 h-8" />
        <button @click="isMobileMenuOpen = false" class="text-2xl text-ink-600 leading-none" aria-label="Close menu">&times;</button>
      </div>
      <nav class="flex flex-col gap-1">
        <RouterLink
          v-for="link in navLinks"
          :key="link.label"
          :to="link.to"
          @click="isMobileMenuOpen = false"
          class="px-3 py-3 rounded-lg text-sm font-medium text-ink-900 hover:bg-lavender-50"
        >
          {{ link.label }}
        </RouterLink>
        <p class="px-3 pt-3 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Grades</p>
        <RouterLink
          v-for="grade in gradeLinks"
          :key="grade"
          :to="{ name: 'public-grades', query: { grade } }"
          @click="isMobileMenuOpen = false"
          class="px-3 py-2 rounded-lg text-sm font-medium text-ink-900 hover:bg-lavender-50"
        >
          {{ grade }}
        </RouterLink>
        <RouterLink
          v-for="link in secondaryNavLinks"
          :key="link.label"
          :to="link.to"
          @click="isMobileMenuOpen = false"
          class="px-3 py-3 rounded-lg text-sm font-medium text-ink-900 hover:bg-lavender-50"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
      <div class="mt-auto flex flex-col gap-2">
        <RouterLink :to="{ name: 'login' }" @click="isMobileMenuOpen = false" class="px-4 py-2.5 rounded-full text-sm font-semibold text-navy-700 border border-navy-200 text-center">
          Login
        </RouterLink>
        <RouterLink :to="{ name: 'public-contact' }" @click="isMobileMenuOpen = false" class="px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-navy-800 text-center">
          Get in touch
        </RouterLink>
      </div>
    </div>
  </Transition>
</template>

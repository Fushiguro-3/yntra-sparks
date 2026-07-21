<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import DemoModeBadge from '@/components/DemoModeBadge.vue'

// Shared chrome for the three authenticated portals (Super Admin,
// Principal, Teacher) — sidebar nav, mobile drawer, topbar, and logout are
// all defined once here instead of being hand-copied per role with small
// drift between copies. Each role's own layout file (AdminLayout.vue etc.)
// is now a ~10-line wrapper passing its nav items and labels in.
const props = defineProps({
  navItems: { type: Array, required: true }, // [{ name, label }]
  roleLabel: { type: String, required: true }, // "Super Admin", "Principal", "Teacher"
  topbarLabel: { type: String, required: true } // "Command centre", "School workspace", ...
})

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const isDrawerOpen = ref(false)
const menuButtonRef = ref(null)

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}

// Same drawer contract as the public Navbar: close on route change,
// Escape, or backdrop click; lock body scroll while open; return focus to
// the trigger button on close.
watch(() => route.fullPath, () => { isDrawerOpen.value = false })

watch(isDrawerOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (!open) nextTick(() => menuButtonRef.value?.focus())
})

function handleKeydown(e) {
  if (e.key === 'Escape' && isDrawerOpen.value) isDrawerOpen.value = false
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="min-h-screen flex flex-col md:flex-row dashboard-shell">
    <!-- Desktop sidebar -->
    <aside class="hidden md:flex md:flex-col dashboard-rail w-64 text-white shrink-0">
      <div class="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <img src="@/assets/logo.png" alt="Yntra Sparks" width="500" height="500" class="w-9 h-9 object-contain" />
        <div class="leading-tight">
          <p class="font-display font-bold text-sm">Yntra Sparks</p>
          <p class="text-[11px] text-white/50">{{ roleLabel }}</p>
        </div>
      </div>
      <nav aria-label="Portal" class="flex-1 px-3 py-3 space-y-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="{ name: item.name }"
          class="dashboard-nav-link block px-3 py-2.5 rounded-xl text-sm text-white/80 hover:bg-white/10 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-400"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
      <div class="px-3 py-4 border-t border-white/10">
        <p class="px-3 pb-2 text-xs text-white/50 truncate" :title="auth.user?.email">{{ auth.user?.email }}</p>
        <button
          @click="handleLogout"
          class="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-400"
        >
          Log out
        </button>
      </div>
    </aside>

    <!-- Mobile topbar -->
    <header class="md:hidden flex items-center justify-between px-4 py-3 dashboard-rail text-white shrink-0">
      <div class="flex items-center gap-2">
        <img src="@/assets/logo.png" alt="Yntra Sparks" width="500" height="500" class="w-8 h-8 object-contain" />
        <div class="leading-tight">
          <p class="font-display font-bold text-sm">Yntra Sparks</p>
          <p class="text-[10px] text-white/50">{{ roleLabel }}</p>
        </div>
      </div>
      <button
        ref="menuButtonRef"
        class="w-11 h-11 flex flex-col items-center justify-center gap-[5px] rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-400"
        @click="isDrawerOpen = true"
        aria-label="Open menu"
        aria-haspopup="true"
        :aria-expanded="isDrawerOpen"
      >
        <span class="w-5 h-0.5 rounded-full bg-white"></span>
        <span class="w-5 h-0.5 rounded-full bg-white"></span>
        <span class="w-5 h-0.5 rounded-full bg-white"></span>
      </button>
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
      <div v-if="isDrawerOpen" class="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-[2px] md:hidden" @click="isDrawerOpen = false" />
    </Transition>
    <Transition
      enter-active-class="transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)]"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-[cubic-bezier(.7,0,.84,0)]"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <div
        v-if="isDrawerOpen"
        role="dialog"
        aria-modal="true"
        :aria-label="`${roleLabel} navigation`"
        class="fixed top-0 left-0 z-50 h-full w-72 dashboard-rail text-white p-5 flex flex-col md:hidden"
      >
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <img src="@/assets/logo.png" alt="Yntra Sparks" width="500" height="500" class="w-9 h-9 object-contain" />
            <p class="font-display font-bold text-sm">Yntra Sparks</p>
          </div>
          <button @click="isDrawerOpen = false" class="text-2xl leading-none text-white/70 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-400 rounded" aria-label="Close menu">&times;</button>
        </div>
        <nav aria-label="Portal" class="flex-1 space-y-1">
          <RouterLink
            v-for="item in navItems"
            :key="item.name"
            :to="{ name: item.name }"
            class="dashboard-nav-link block px-3 py-3 rounded-xl text-sm text-white/80 hover:bg-white/10 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-400"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
        <div class="pt-4 border-t border-white/10">
          <p class="px-3 pb-2 text-xs text-white/50 truncate">{{ auth.user?.email }}</p>
          <button
            @click="handleLogout"
            class="w-full text-left px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-400"
          >
            Log out
          </button>
        </div>
      </div>
    </Transition>

    <main class="flex-1 min-w-0">
      <header class="hidden md:flex bg-white/80 backdrop-blur border-b border-navy-100 px-5 md:px-8 py-4 items-center justify-between">
        <p class="text-sm text-ink-600 truncate">{{ auth.user?.email }}</p>
        <div class="flex items-center gap-2 shrink-0">
          <DemoModeBadge />
          <span class="text-xs font-bold text-navy-700 bg-navy-50 rounded-full px-3 py-1.5 whitespace-nowrap">{{ topbarLabel }}</span>
        </div>
      </header>
      <div class="p-4 sm:p-5 md:p-8">
        <RouterView v-slot="{ Component }">
          <div class="page-wrapper">
            <component :is="Component" />
          </div>
        </RouterView>
      </div>
    </main>
  </div>
</template>

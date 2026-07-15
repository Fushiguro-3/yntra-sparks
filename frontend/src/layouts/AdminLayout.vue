<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const nav = [
  { name: 'admin-schools', label: 'Schools' },
  { name: 'admin-categories', label: 'Categories' },
  { name: 'admin-kits', label: 'Kits' },
  { name: 'admin-messages', label: 'Messages' }
]

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen flex flex-col md:flex-row dashboard-shell">
    <aside class="dashboard-rail w-full md:w-64 text-white flex flex-col shrink-0">
      <div class="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <img src="@/assets/logo.png" alt="Yntra Sparks" class="w-8 h-8" />
        <div class="leading-tight">
          <p class="font-display font-bold text-sm">Yntra Sparks</p>
          <p class="text-[11px] text-white/50">Super Admin</p>
        </div>
      </div>
      <nav class="flex-1 px-3 py-3 flex md:block gap-2 overflow-x-auto md:space-y-1">
        <RouterLink
          v-for="item in nav"
          :key="item.name"
          :to="{ name: item.name }"
          class="dashboard-nav-link whitespace-nowrap block px-3 py-2.5 rounded-xl text-sm text-white/80 hover:bg-white/10 hover:text-white transition"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
      <div class="hidden md:block px-3 py-4 border-t border-white/10">
        <button
          @click="handleLogout"
          class="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
        >
          Log out
        </button>
      </div>
    </aside>

    <main class="flex-1 min-w-0">
      <header class="bg-white/80 backdrop-blur border-b border-navy-100 px-5 md:px-8 py-4 flex items-center justify-between">
        <p class="text-sm text-ink-600">{{ auth.user?.email }}</p>
        <span class="text-xs font-bold text-navy-700 bg-navy-50 rounded-full px-3 py-1.5">Command centre</span>
      </header>
      <div class="p-5 md:p-8">
        <RouterView v-slot="{ Component }">
          <div class="page-wrapper">
            <component :is="Component" />
          </div>
        </RouterView>
      </div>
    </main>
  </div>
</template>

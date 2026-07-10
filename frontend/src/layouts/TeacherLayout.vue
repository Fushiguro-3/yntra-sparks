<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const nav = [
  { name: 'teacher-kits', label: 'My School\'s Kits' }
]

const auth = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen flex bg-slate-50">
    <aside class="w-60 bg-navy-900 text-white flex flex-col shrink-0">
      <div class="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <img src="@/assets/logo.png" alt="Yntra Sparks" class="w-8 h-8" />
        <div class="leading-tight">
          <p class="font-display font-bold text-sm">Yntra Sparks</p>
          <p class="text-[11px] text-white/50">Teacher</p>
        </div>
      </div>
      <nav class="flex-1 px-3 py-4 space-y-1">
        <RouterLink
          v-for="item in nav"
          :key="item.name"
          :to="{ name: item.name }"
          class="block px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition"
          active-class="bg-spark-600 text-white hover:bg-spark-600"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
      <div class="px-3 py-4 border-t border-white/10">
        <button
          @click="handleLogout"
          class="w-full text-left px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition"
        >
          Log out
        </button>
      </div>
    </aside>

    <main class="flex-1 min-w-0">
      <header class="bg-white border-b border-slate-200 px-8 py-4">
        <p class="text-sm text-slate-500">{{ auth.user?.email }}</p>
      </header>
      <div class="p-8">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  code: { type: Number, default: 404 }
})

const router = useRouter()
const auth = useAuthStore()

const copy = {
  403: {
    title: '403 — Access Denied',
    message: "You're signed in, but your account doesn't have access to this page."
  },
  404: {
    title: '404 — Page Not Found',
    message: "The page you're looking for doesn't exist."
  }
}[props.code]

function goHome() {
  router.push(auth.isAuthenticated ? auth.homePath : '/login')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 px-4">
    <div class="text-center max-w-sm">
      <p class="font-display text-6xl font-extrabold text-navy-800 mb-4">{{ code }}</p>
      <h1 class="text-lg font-semibold text-slate-800 mb-2">{{ copy.title }}</h1>
      <p class="text-slate-500 text-sm mb-6">{{ copy.message }}</p>
      <button
        @click="goHome"
        class="px-5 py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-navy-800 to-navy-600 hover:from-navy-900 hover:to-navy-700 transition"
      >
        Go back
      </button>
    </div>
  </div>
</template>

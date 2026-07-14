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
  <div class="min-h-screen flex items-center justify-center accent-grid px-4">
    <div class="text-center max-w-sm app-surface rounded-[28px] p-8 page-enter">
      <p class="font-display text-6xl font-extrabold text-spark-600 mb-3">{{ code }}</p>
      <h1 class="font-display text-xl font-bold text-navy-900 mb-2">{{ copy.title }}</h1>
      <p class="text-ink-600 text-sm mb-7">{{ copy.message }}</p>
      <button
        @click="goHome"
        class="app-button-primary"
      >
        Go back
      </button>
    </div>
  </div>
</template>

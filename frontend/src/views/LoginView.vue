<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

async function handleSubmit() {
  errorMessage.value = ''

  if (!email.value.trim() || !password.value.trim()) {
    errorMessage.value = 'Please fill all fields.'
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errorMessage.value = 'Please enter a valid email address.'
    return
  }

  isSubmitting.value = true
  try {
    await auth.login(email.value, password.value)
    // user.mustChangePassword is returned by the backend but there's no
    // forced-change-password screen yet (api-contract.md open question) —
    // nothing to act on here until that's built.
    const redirect = route.query.redirect
    const target = typeof redirect === 'string' ? redirect : null
    router.push(target || auth.homePath)
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 px-4">
    <div class="w-full max-w-md">
      <div class="flex flex-col items-center mb-8">
        <img src="@/assets/logo.png" alt="Yntra Sparks" class="w-20 h-20 mb-3" />
        <h1 class="font-display text-2xl font-bold text-navy-900">Yntra Sparks</h1>
        <p class="text-slate-500 text-sm mt-1">Sign in to your dashboard</p>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              v-model="email"
              type="email"
              placeholder="you@school.com"
              autocomplete="username"
              class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              class="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent"
            >
          </div>

          <p v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full py-2.5 rounded-lg font-semibold text-white bg-gradient-to-r from-navy-800 to-navy-600 hover:from-navy-900 hover:to-navy-700 transition disabled:opacity-60"
          >
            {{ isSubmitting ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>
      </div>

      <p class="text-center text-xs text-slate-400 mt-6">
        Accounts are created by administrators — there's no self-signup.
      </p>
    </div>
  </div>
</template>

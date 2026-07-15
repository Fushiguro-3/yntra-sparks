<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import FloatingBubbles from '@/components/public/FloatingBubbles.vue'

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
  <div class="min-h-screen flex items-center justify-center accent-grid px-4 py-10 relative overflow-hidden">
    <FloatingBubbles density="soft" />
    <span class="absolute -left-20 top-12 w-64 h-48 blue-splash opacity-35 animate-float"></span>
    <span class="absolute -right-20 bottom-10 w-64 h-52 orange-splash opacity-35 animate-float" style="animation-delay: -1.7s"></span>
    <div class="w-full max-w-md relative z-10 page-enter">
      <div class="flex flex-col items-center mb-7 text-center">
        <div class="bg-white rounded-[26px] shadow-[0_12px_30px_rgba(10,31,77,.12)] p-3 mb-4">
          <img src="@/assets/logo.png" alt="Yntra Sparks" class="w-16 h-16" />
        </div>
        <p class="text-xs font-bold uppercase tracking-[.18em] text-spark-600 mb-2">Learning starts here</p>
        <h1 class="font-display text-3xl font-bold text-navy-900">Welcome back</h1>
        <p class="text-ink-600 text-sm mt-2">Sign in to continue to your Yntra Sparks workspace.</p>
      </div>

      <div class="app-surface rounded-[28px] p-6 sm:p-8">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div data-aos="fade-up" data-aos-delay="100">
            <label class="block text-sm font-bold text-navy-900 mb-1.5">Email address</label>
            <input
              v-model="email"
              type="email"
              placeholder="you@school.com"
              autocomplete="username"
              class="app-input"
            >
          </div>

          <div data-aos="fade-up" data-aos-delay="220">
            <label class="block text-sm font-bold text-navy-900 mb-1.5">Password</label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              class="app-input"
            >
          </div>

          <Transition name="field-message">
            <p v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {{ errorMessage }}
            </p>
          </Transition>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="app-button-primary w-full"
            data-aos="fade-up"
            data-aos-delay="340"
          >
            <span v-if="isSubmitting" class="btn-spinner" aria-hidden="true"></span>
            {{ isSubmitting ? 'Signing in…' : 'Sign In' }}
          </button>
        </form>
      </div>

      <p class="text-center text-xs text-ink-600 mt-5">
        Accounts are created by administrators — there's no self-signup.
      </p>
    </div>
  </div>
</template>

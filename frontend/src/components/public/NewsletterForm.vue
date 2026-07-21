<script setup>
import { ref } from 'vue'
import { newsletterService } from '@/services/newsletterService'
import { newsletterSubscriberStore } from '@/services/newsletterSubscriberStore'
import { isFeatureConfigured } from '@/utils/env'

const isConfigured = isFeatureConfigured('buttondown')
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const email = ref('')
const status = ref('idle') // idle | loading | success | already-subscribed | error
const errorMessage = ref('')

async function handleSubmit() {
  if (status.value === 'loading') return // duplicate-submit guard

  const trimmed = email.value.trim()
  if (!trimmed) {
    status.value = 'error'
    errorMessage.value = 'Please enter your email.'
    return
  }
  if (!emailRegex.test(trimmed)) {
    status.value = 'error'
    errorMessage.value = 'Please enter a valid email address.'
    return
  }

  if (newsletterSubscriberStore.has(trimmed)) {
    status.value = 'already-subscribed'
    return
  }

  status.value = 'loading'
  errorMessage.value = ''
  try {
    await newsletterService.subscribe(trimmed)
    newsletterSubscriberStore.add(trimmed)
    status.value = 'success'
    email.value = ''
  } catch {
    status.value = 'error'
    errorMessage.value = 'Could not reach the newsletter service. Please try again.'
  }
}

function reset() {
  status.value = 'idle'
  errorMessage.value = ''
  email.value = ''
}
</script>

<template>
  <div>
    <p v-if="!isConfigured" class="text-xs text-white/50 leading-relaxed">
      Newsletter signup is temporarily unavailable.
    </p>

    <template v-else-if="status === 'success'">
      <p class="text-sm text-emerald-300" role="status">
        You're almost in! Check your inbox to confirm your subscription.
      </p>
      <button @click="reset" type="button" class="mt-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
        Use a different email
      </button>
    </template>

    <template v-else-if="status === 'already-subscribed'">
      <p class="text-sm text-white/70" role="status">You're already on the list — thanks!</p>
      <button @click="reset" type="button" class="mt-1.5 text-xs text-white/50 hover:text-white/80 transition-colors">
        Use a different email
      </button>
    </template>

    <form v-else class="flex gap-2" @submit.prevent="handleSubmit" novalidate>
      <div class="flex-1 min-w-0">
        <label for="newsletter-email" class="sr-only">Email address</label>
        <input
          id="newsletter-email"
          v-model="email"
          type="email"
          placeholder="you@school.com"
          autocomplete="email"
          :disabled="status === 'loading'"
          :aria-invalid="status === 'error'"
          aria-describedby="newsletter-email-error"
          class="w-full min-w-0 px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-spark-500 disabled:opacity-60"
        >
        <p v-if="status === 'error'" id="newsletter-email-error" class="mt-1.5 text-xs text-red-300" role="alert">{{ errorMessage }}</p>
      </div>
      <button
        type="submit"
        :disabled="status === 'loading'"
        class="relative overflow-hidden mkt-btn-shine px-4 py-2 rounded-lg bg-spark-500 hover:bg-spark-600 hover:scale-[1.05] hover:-translate-y-0.5 active:scale-[0.95] active:duration-100 text-sm font-semibold transition-transform duration-[360ms] ease-[cubic-bezier(.16,1,.3,1)] shrink-0 disabled:opacity-60 disabled:pointer-events-none"
      >
        {{ status === 'loading' ? 'Joining…' : 'Join' }}
      </button>
    </form>
  </div>
</template>

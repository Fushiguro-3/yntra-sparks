<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import FloatingBubbles from '@/components/public/FloatingBubbles.vue'

const auth = useAuthStore()
const router = useRouter()

const form = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const errorMessage = ref('')
const isSubmitting = ref(false)
const succeeded = ref(false)
const isLoggingOut = ref(false)

const strength = computed(() => {
  const value = form.newPassword
  if (!value) return { score: 0, label: '' }
  let score = 0
  if (value.length >= 8) score++
  if (value.length >= 12) score++
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++
  if (/\d/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong', 'Strong']
  return { score, label: labels[score] }
})

function validate() {
  if (!form.currentPassword) return 'Please enter your current password.'
  if (form.newPassword.length < 8) return 'New password must be at least 8 characters.'
  if (!/[a-zA-Z]/.test(form.newPassword) || !/\d/.test(form.newPassword)) {
    return 'New password must include at least one letter and one number.'
  }
  if (form.newPassword === form.currentPassword) return 'New password must be different from your current password.'
  if (form.newPassword !== form.confirmPassword) return 'Passwords do not match.'
  return ''
}

async function handleSubmit() {
  if (isSubmitting.value) return
  errorMessage.value = validate()
  if (errorMessage.value) return

  isSubmitting.value = true
  try {
    await auth.changePassword(form.currentPassword, form.newPassword)
    succeeded.value = true
    // Brief confirmation before handing off — router guard now lets this
    // role through since auth.user.mustChangePassword is false.
    setTimeout(() => {
      router.push(auth.homePath)
    }, 900)
  } catch (err) {
    errorMessage.value = err.message || 'Could not update your password. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

async function handleLogout() {
  isLoggingOut.value = true
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center accent-grid px-4 py-10 relative overflow-y-auto">
    <FloatingBubbles density="soft" />
    <div class="w-full max-w-md relative z-10 page-enter">
      <div class="flex flex-col items-center mb-7 text-center">
        <div class="bg-white rounded-[26px] shadow-[0_12px_30px_rgba(10,31,77,.12)] p-3 mb-4">
          <img src="@/assets/logo.png" alt="Yntra Sparks" class="w-16 h-16" />
        </div>
        <p class="text-xs font-bold uppercase tracking-[.18em] text-spark-600 mb-2">One more step</p>
        <h1 class="font-display text-3xl font-bold text-navy-900">Set a new password</h1>
        <p class="text-ink-600 text-sm mt-2">
          Your account was created with a temporary password. Choose a new one to continue to your workspace.
        </p>
      </div>

      <div class="app-surface rounded-[28px] p-6 sm:p-8 flex flex-col">
        <div v-if="succeeded" class="text-center py-4" role="status">
          <p class="font-display font-medium text-navy-900 mb-1">Password updated</p>
          <p class="text-sm text-ink-600">Taking you to your workspace…</p>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="space-y-4" novalidate>
          <div>
            <label for="current-password" class="block text-sm font-bold text-navy-900 mb-1.5">Current (temporary) password</label>
            <input
              id="current-password"
              v-model="form.currentPassword"
              type="password"
              autocomplete="current-password"
              class="app-input"
            >
          </div>

          <div>
            <label for="new-password" class="block text-sm font-bold text-navy-900 mb-1.5">New password</label>
            <input
              id="new-password"
              v-model="form.newPassword"
              type="password"
              autocomplete="new-password"
              class="app-input"
              aria-describedby="password-strength"
            >
            <div v-if="form.newPassword" id="password-strength" class="mt-2">
              <div class="flex gap-1" aria-hidden="true">
                <span
                  v-for="i in 5"
                  :key="i"
                  class="h-1 flex-1 rounded-full transition-colors"
                  :class="i <= strength.score ? (strength.score <= 2 ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-200'"
                ></span>
              </div>
              <p class="text-xs text-ink-600 mt-1">{{ strength.label }} · at least 8 characters, with a letter and a number</p>
            </div>
          </div>

          <div>
            <label for="confirm-password" class="block text-sm font-bold text-navy-900 mb-1.5">Confirm new password</label>
            <input
              id="confirm-password"
              v-model="form.confirmPassword"
              type="password"
              autocomplete="new-password"
              class="app-input"
            >
          </div>

          <Transition name="field-message">
            <p v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
              {{ errorMessage }}
            </p>
          </Transition>

          <button type="submit" :disabled="isSubmitting" class="app-button-primary w-full">
            <span v-if="isSubmitting" class="btn-spinner" aria-hidden="true"></span>
            {{ isSubmitting ? 'Updating…' : 'Update password' }}
          </button>
        </form>
      </div>

      <button
        v-if="!succeeded"
        @click="handleLogout"
        :disabled="isLoggingOut"
        class="w-full text-center text-xs text-ink-600 hover:text-navy-700 mt-5 disabled:opacity-60"
      >
        {{ isLoggingOut ? 'Logging out…' : 'Not you? Log out' }}
      </button>
    </div>
  </div>
</template>

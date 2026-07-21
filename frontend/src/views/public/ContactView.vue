<script setup>
import { computed, reactive, ref } from 'vue'
import MarketingButton from '@/components/public/MarketingButton.vue'
import { env, isFeatureConfigured } from '@/utils/env'
import { web3formsMessageStore } from '@/services/web3formsMessageStore'

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit'
const isConfigured = isFeatureConfigured('web3forms')

const emptyForm = () => ({ name: '', email: '', subject: '', message: '' })
const form = reactive(emptyForm())
const fieldErrors = reactive({ name: '', email: '', subject: '', message: '' })

const submitted = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate() {
  fieldErrors.name = form.name.trim() ? '' : 'Please enter your name.'
  fieldErrors.email = !form.email.trim()
    ? 'Please enter your email.'
    : emailRegex.test(form.email.trim())
      ? ''
      : 'Please enter a valid email address.'
  fieldErrors.subject = form.subject.trim() ? '' : 'Please add a subject.'
  fieldErrors.message = form.message.trim() ? '' : 'Please add a message.'
  return !fieldErrors.name && !fieldErrors.email && !fieldErrors.subject && !fieldErrors.message
}

const isFormValid = computed(() => !Object.values(fieldErrors).some(Boolean))

async function handleSubmit() {
  errorMessage.value = ''

  // Guards against double-submit from a double-click or a held Enter key —
  // isSubmitting already disables the button, but this is a synchronous
  // re-entrancy check so a second call can never slip in before Vue
  // re-renders the disabled state.
  if (isSubmitting.value) return
  if (!validate()) return

  isSubmitting.value = true
  try {
    const res = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        access_key: env.web3formsAccessKey,
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim()
      })
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.message || 'Submission failed')

    // Only persist locally once Web3Forms has confirmed the send — a
    // failed request should never show up in Super Admin Messages.
    web3formsMessageStore.add({
      name: form.name.trim(),
      email: form.email.trim(),
      subject: form.subject.trim(),
      message: form.message.trim()
    })

    submitted.value = true
  } catch (err) {
    errorMessage.value = err.message || 'Something went wrong. Please try again.'
  } finally {
    isSubmitting.value = false
  }
}

function sendAnother() {
  Object.assign(form, emptyForm())
  fieldErrors.name = fieldErrors.email = fieldErrors.subject = fieldErrors.message = ''
  errorMessage.value = ''
  submitted.value = false
}
</script>

<template>
  <section class="max-w-[1440px] mx-auto px-5 md:px-10 pt-16 pb-20 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
    <div data-aos="slide-right">
      <p class="text-xs font-bold uppercase tracking-[.18em] text-spark-600 mb-2">Let’s build together</p>
      <h1 class="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-3">Get in touch</h1>
      <p class="text-ink-600 max-w-md mb-6">Tell us about your school’s learning goals and we’ll help you find the right hands-on experience.</p>

      <div v-if="!isConfigured" class="app-surface rounded-[28px] p-6 sm:p-7">
        <p class="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2" role="alert">
          The contact form is temporarily unavailable. Please reach us directly using the details alongside.
        </p>
      </div>

      <form v-else-if="!submitted" @submit.prevent="handleSubmit" class="space-y-4 app-surface rounded-[28px] p-6 sm:p-7" novalidate>
        <p v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">{{ errorMessage }}</p>
        <div>
          <label for="contact-name" class="block text-xs font-semibold uppercase tracking-wide text-ink-900 mb-1.5">Name</label>
          <input
            id="contact-name"
            v-model="form.name"
            type="text"
            class="app-input"
            placeholder="Your full name"
            autocomplete="name"
            :aria-invalid="!!fieldErrors.name"
            aria-describedby="contact-name-error"
          >
          <p v-if="fieldErrors.name" id="contact-name-error" class="mt-1 text-xs text-red-600">{{ fieldErrors.name }}</p>
        </div>
        <div>
          <label for="contact-email" class="block text-xs font-semibold uppercase tracking-wide text-ink-900 mb-1.5">Email</label>
          <input
            id="contact-email"
            v-model="form.email"
            type="email"
            class="app-input"
            placeholder="you@school.com"
            autocomplete="email"
            :aria-invalid="!!fieldErrors.email"
            aria-describedby="contact-email-error"
          >
          <p v-if="fieldErrors.email" id="contact-email-error" class="mt-1 text-xs text-red-600">{{ fieldErrors.email }}</p>
        </div>
        <div>
          <label for="contact-subject" class="block text-xs font-semibold uppercase tracking-wide text-ink-900 mb-1.5">Subject</label>
          <input
            id="contact-subject"
            v-model="form.subject"
            type="text"
            class="app-input"
            placeholder="How can we help?"
            :aria-invalid="!!fieldErrors.subject"
            aria-describedby="contact-subject-error"
          >
          <p v-if="fieldErrors.subject" id="contact-subject-error" class="mt-1 text-xs text-red-600">{{ fieldErrors.subject }}</p>
        </div>
        <div>
          <label for="contact-message" class="block text-xs font-semibold uppercase tracking-wide text-ink-900 mb-1.5">Message</label>
          <textarea
            id="contact-message"
            v-model="form.message"
            rows="4"
            class="app-input resize-y"
            placeholder="Tell us a little about your classroom needs"
            :aria-invalid="!!fieldErrors.message"
            aria-describedby="contact-message-error"
          ></textarea>
          <p v-if="fieldErrors.message" id="contact-message-error" class="mt-1 text-xs text-red-600">{{ fieldErrors.message }}</p>
        </div>
        <MarketingButton type="submit" variant="primary" :disabled="isSubmitting">
          {{ isSubmitting ? 'Sending...' : 'Send Message' }}
        </MarketingButton>
      </form>

      <div v-else class="app-surface rounded-[28px] p-7 page-enter" role="status">
        <p class="font-display font-medium text-navy-900 mb-1">Thanks, we'll be in touch.</p>
        <p class="text-sm text-ink-600 mb-4">Your message has been sent. The Yntra Sparks team can follow up from here.</p>
        <button @click="sendAnother" class="text-sm font-semibold text-spark-600 hover:text-spark-700">
          Send another message →
        </button>
      </div>
    </div>

    <div class="dashboard-hero rounded-[28px] p-7 h-fit relative" data-aos="slide-left">
      <span class="absolute -right-12 -top-8 w-32 h-28 blue-splash opacity-80"></span>
      <span class="absolute -left-12 -bottom-8 w-32 h-28 orange-splash opacity-80"></span>
      <div class="relative">
        <p class="text-xs font-bold uppercase tracking-[.16em] text-spark-300 mb-2">Yntra Sparks</p>
        <p class="font-display text-2xl font-bold text-white mb-5">Contact info</p>
        <div class="space-y-4 text-sm text-white/80">
          <p><span class="block text-xs uppercase tracking-wide text-white/50 mb-1">Call</span> <a href="tel:+918080270366" class="block hover:text-spark-400 transition-colors">
    +91 80802 70366
  </a>

  <a href="tel:+917667972579" class="block hover:text-spark-400 transition-colors mt-1">
    +91 76679 72579
  </a></p>
          <p><span class="block text-xs uppercase tracking-wide text-white/50 mb-1">Email</span>yntrasparksofficial@gmail.com</p>
          <p><span class="block text-xs uppercase tracking-wide text-white/50 mb-1">Based in</span>Dharwad, Karnataka, India</p>
        </div>
      </div>
    </div>
  </section>
</template>

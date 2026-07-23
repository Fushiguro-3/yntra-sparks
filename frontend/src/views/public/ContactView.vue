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
  <section class="max-w-[1180px] mx-auto px-5 md:px-10 pt-16 pb-20">
    <div class="text-center mb-10 lg:mb-12" data-aos="fade-up">
      <p class="eyebrow-label mb-2">Let&rsquo;s build together</p>
      <h1 class="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-3">Get in touch</h1>
      <p class="text-ink-600 max-w-lg mx-auto">Tell us about your school&rsquo;s learning goals and we&rsquo;ll help you find the right hands-on experience.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-[1.15fr,0.85fr] gap-8 lg:gap-10 items-start">
      <div data-aos="slide-right">
        <div v-if="!isConfigured" class="app-surface rounded-[28px] p-6 sm:p-7">
          <p class="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2" role="alert">
            The contact form is temporarily unavailable. Please reach us directly using the details alongside.
          </p>
        </div>

        <form v-else-if="!submitted" @submit.prevent="handleSubmit" class="space-y-5 app-surface rounded-[28px] p-6 sm:p-8" novalidate>
          <p v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">{{ errorMessage }}</p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              rows="5"
              class="app-input resize-y"
              placeholder="Tell us a little about your classroom needs"
              :aria-invalid="!!fieldErrors.message"
              aria-describedby="contact-message-error"
            ></textarea>
            <p v-if="fieldErrors.message" id="contact-message-error" class="mt-1 text-xs text-red-600">{{ fieldErrors.message }}</p>
          </div>
          <MarketingButton type="submit" variant="primary" :disabled="isSubmitting" class="w-full sm:w-auto">
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

      <div class="dashboard-hero rounded-[28px] p-7 sm:p-8 relative" data-aos="slide-left">
        <span class="absolute -right-12 -top-8 w-32 h-28 blue-splash opacity-80"></span>
        <span class="absolute -left-12 -bottom-8 w-32 h-28 orange-splash opacity-80"></span>
        <div class="relative">
          <p class="eyebrow-label-inverse mb-2">Yntra Sparks</p>
          <p class="font-display text-2xl font-bold text-white mb-6">Contact info</p>
          <div class="space-y-5 text-sm text-white/85">
            <div class="flex gap-3">
              <span class="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6.6 10.8c1.4 2.8 3.7 5.1 6.5 6.5l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.7 21 3 13.3 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.3 0 .7-.2 1L6.6 10.8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
              </span>
              <div class="min-w-0">
                <span class="eyebrow-label-inverse block mb-1">Call</span>
                <a href="tel:+918080270366" class="block hover:text-spark-400 transition-colors break-words">+91 80802 70366</a>
                <a href="tel:+917667972579" class="block hover:text-spark-400 transition-colors break-words mt-0.5">+91 76679 72579</a>
              </div>
            </div>
            <div class="flex gap-3">
              <span class="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 6h18v12H3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M3 6l9 7 9-7" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
              </span>
              <div class="min-w-0">
                <span class="eyebrow-label-inverse block mb-1">Email</span>
                <a href="mailto:yntrasparksofficial@gmail.com" class="block hover:text-spark-400 transition-colors break-words">yntrasparksofficial@gmail.com</a>
              </div>
            </div>
            <div class="flex gap-3">
              <span class="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0" aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><circle cx="12" cy="10" r="2.4" stroke="currentColor" stroke-width="1.5"/></svg>
              </span>
              <div class="min-w-0">
                <span class="eyebrow-label-inverse block mb-1">Based in</span>
                <span class="block break-words">Dharwad, Karnataka, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

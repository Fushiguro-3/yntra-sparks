<script setup>
import { ref } from 'vue'
import MarketingButton from '@/components/public/MarketingButton.vue'
import { publicService } from '@/api/publicService'

const form = ref({ name: '', email: '', subject: '', message: '' })
const submitted = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true
  try {
    await publicService.submitContact(form.value)
    submitted.value = true
    form.value = { name: '', email: '', subject: '', message: '' }
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="max-w-[1440px] mx-auto px-5 md:px-10 pt-16 pb-20 grid grid-cols-1 md:grid-cols-2 gap-12">
    <div data-aos="slide-right">
      <h1 class="font-display text-3xl font-bold text-navy-900 mb-6">Get in Touch</h1>

      <form v-if="!submitted" @submit.prevent="handleSubmit" class="space-y-4 bg-white rounded-[24px] p-6 kit-card-fun">
        <p v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ errorMessage }}</p>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wide text-ink-900 mb-1.5">Name</label>
          <input v-model="form.name" type="text" required class="w-full px-3 py-2.5 border border-line-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-300">
        </div>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wide text-ink-900 mb-1.5">Email</label>
          <input v-model="form.email" type="email" required class="w-full px-3 py-2.5 border border-line-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-300">
        </div>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wide text-ink-900 mb-1.5">Subject</label>
          <input v-model="form.subject" type="text" required class="w-full px-3 py-2.5 border border-line-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-300">
        </div>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wide text-ink-900 mb-1.5">Message</label>
          <textarea v-model="form.message" rows="4" required class="w-full px-3 py-2.5 border border-line-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-300"></textarea>
        </div>
        <MarketingButton type="submit" variant="primary" :disabled="isSubmitting">
          {{ isSubmitting ? 'Sending...' : 'Send Message' }}
        </MarketingButton>
      </form>

      <div v-else class="bg-lavender-50 rounded-2xl p-6">
        <p class="font-display font-medium text-navy-900 mb-1">Thanks, we'll be in touch.</p>
        <p class="text-sm text-ink-600">Your message has been saved. The Yntra Sparks team can follow up from here.</p>
      </div>
    </div>

    <div class="bg-white rounded-[24px] p-7 kit-card-fun h-fit relative overflow-hidden" data-aos="slide-left">
      <span class="absolute -right-12 -top-8 w-32 h-28 blue-splash opacity-80"></span>
      <span class="absolute -left-12 -bottom-8 w-32 h-28 orange-splash opacity-80"></span>
      <div class="relative">
        <p class="font-display font-medium text-navy-900 mb-4">Contact Info</p>
        <div class="space-y-3 text-sm text-ink-600">
          <p>+91 80802 70366</p>
          <p>yntrasparksofficial@gmail.com</p>
          <p>Dharwad, Karnataka, India</p>
        </div>
      </div>
    </div>
  </section>
</template>

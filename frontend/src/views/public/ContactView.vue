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
  <section class="max-w-[1440px] mx-auto px-5 md:px-10 pt-16 pb-20 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
    <div data-aos="slide-right">
      <p class="text-xs font-bold uppercase tracking-[.18em] text-spark-600 mb-2">Let’s build together</p>
      <h1 class="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-3">Get in touch</h1>
      <p class="text-ink-600 max-w-md mb-6">Tell us about your school’s learning goals and we’ll help you find the right hands-on experience.</p>

      <form v-if="!submitted" @submit.prevent="handleSubmit" class="space-y-4 app-surface rounded-[28px] p-6 sm:p-7">
        <p v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ errorMessage }}</p>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wide text-ink-900 mb-1.5">Name</label>
          <input v-model="form.name" type="text" required class="app-input" placeholder="Your full name">
        </div>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wide text-ink-900 mb-1.5">Email</label>
          <input v-model="form.email" type="email" required class="app-input" placeholder="you@school.com">
        </div>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wide text-ink-900 mb-1.5">Subject</label>
          <input v-model="form.subject" type="text" required class="app-input" placeholder="How can we help?">
        </div>
        <div>
          <label class="block text-xs font-semibold uppercase tracking-wide text-ink-900 mb-1.5">Message</label>
          <textarea v-model="form.message" rows="4" required class="app-input resize-y" placeholder="Tell us a little about your classroom needs"></textarea>
        </div>
        <MarketingButton type="submit" variant="primary" :disabled="isSubmitting">
          {{ isSubmitting ? 'Sending...' : 'Send Message' }}
        </MarketingButton>
      </form>

      <div v-else class="app-surface rounded-[28px] p-7 page-enter">
        <p class="font-display font-medium text-navy-900 mb-1">Thanks, we'll be in touch.</p>
        <p class="text-sm text-ink-600">Your message has been saved. The Yntra Sparks team can follow up from here.</p>
      </div>
    </div>

    <div class="dashboard-hero rounded-[28px] p-7 h-fit relative" data-aos="slide-left">
      <span class="absolute -right-12 -top-8 w-32 h-28 blue-splash opacity-80"></span>
      <span class="absolute -left-12 -bottom-8 w-32 h-28 orange-splash opacity-80"></span>
      <div class="relative">
        <p class="text-xs font-bold uppercase tracking-[.16em] text-spark-300 mb-2">Yntra Sparks</p>
        <p class="font-display text-2xl font-bold text-white mb-5">Contact info</p>
        <div class="space-y-4 text-sm text-white/80">
          <p><span class="block text-xs uppercase tracking-wide text-white/50 mb-1">Call</span>+91 80802 70366</p>
          <p><span class="block text-xs uppercase tracking-wide text-white/50 mb-1">Email</span>yntrasparksofficial@gmail.com</p>
          <p><span class="block text-xs uppercase tracking-wide text-white/50 mb-1">Based in</span>Dharwad, Karnataka, India</p>
        </div>
      </div>
    </div>
  </section>
</template>

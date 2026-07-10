<script setup>
import MarketingButton from './MarketingButton.vue'
</script>

<template>
  <section class="max-w-[1440px] mx-auto px-5 md:px-10 py-16" data-aos="zoom-pop">
    <div class="rounded-[28px] bg-navy-900 px-8 py-14 md:px-16 text-center relative overflow-hidden">
      <div class="absolute -top-12 -right-10 w-56 h-40 orange-splash opacity-80"></div>
      <div class="absolute -bottom-16 -left-12 w-64 h-44 blue-splash opacity-80"></div>
      <h2 class="font-display text-2xl md:text-3xl font-semibold text-white mb-3 relative">
        Ready to bring hands-on STEM to your school?
      </h2>
      <p class="text-white/70 max-w-lg mx-auto mb-7 relative">
        Join schools already using Yntra Sparks kits to turn curiosity into capability.
      </p>
      <MarketingButton as="router-link" :to="{ name: 'public-contact' }" variant="secondary" size="lg" class="relative">
        Get in touch
      </MarketingButton>
    </div>
  </section>
</template>

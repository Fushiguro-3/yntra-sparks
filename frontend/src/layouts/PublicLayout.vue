<script setup>
import Navbar from '@/components/public/Navbar.vue'
import Footer from '@/components/public/Footer.vue'
</script>

<template>
  <div class="min-h-screen playful-shell flex flex-col">
    <Navbar />
    <main class="flex-1 playful-layer page-enter">
      <RouterView />
    </main>
    <div class="playful-layer">
      <Footer />
    </div>
  </div>
</template>

<script setup>
import { env } from '@/utils/env'
</script>

<template>
  <span
    v-if="env.demoMode"
    class="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5"
    title="Running on mock data — no backend is connected"
  >
    <span class="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true"></span>
    Demo Mode
  </span>
</template>

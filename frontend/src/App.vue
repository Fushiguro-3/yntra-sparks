<script setup>
import { onMounted, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()

onMounted(() => {
  auth.bootstrap()
})

// Only the authenticated dashboard routes (meta.roles) need to wait on
// bootstrap before rendering — the public marketing site and /login don't
// depend on auth state at all, so gating them too would show a pointless
// blank flash on every homepage visit.
const needsBootstrapGate = computed(() => !!route.meta.roles)
</script>

<template>
  <!--
    While bootstrap() resolves, render nothing rather than flashing a login
    screen that might immediately redirect. Router guards also wait on
    isBootstrapping (see router/index.js) — this is purely to avoid a
    flash of unauthenticated UI, not the actual guard logic.
  -->
  <div v-if="needsBootstrapGate && auth.isBootstrapping" class="min-h-screen flex items-center justify-center bg-slate-50">
    <img src="@/assets/logo.png" alt="Yntra Sparks" class="w-16 h-16 animate-pulse" />
  </div>
  <RouterView v-else />
</template>

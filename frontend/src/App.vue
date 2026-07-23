<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { routeTransition } from '@/utils/page-transition'
import ToastContainer from '@/components/ToastContainer.vue'
import ConfirmDialog from '@/components/ConfirmDialog.vue'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

onMounted(() => {
  auth.bootstrap()
})

// Only routes that depend on auth state (meta.roles or meta.requiresAuth,
// e.g. /change-password) need to wait on bootstrap before rendering — the
// public marketing site and /login don't, so gating them too would show a
// pointless blank flash on every homepage visit.
const needsBootstrapGate = computed(() => !!route.meta.roles || !!route.meta.requiresAuth)

// Purely cosmetic top progress bar tracking route changes — observes
// navigation via router.beforeEach/afterEach without altering any guard
// or redirect logic (those live entirely in router/index.js). Pairs with
// the route-fade transition so a navigation always feels acknowledged
// the instant it starts, not just once the new page has faded in.
const progressState = ref('idle') // 'idle' | 'active' | 'done'
let doneTimer = null

const removeBeforeGuard = router.beforeEach(() => {
  clearTimeout(doneTimer)
  progressState.value = 'active'
})
const removeAfterGuard = router.afterEach(() => {
  progressState.value = 'done'
  doneTimer = setTimeout(() => { progressState.value = 'idle' }, 260)
})

onUnmounted(() => {
  removeBeforeGuard()
  removeAfterGuard()
  clearTimeout(doneTimer)
})
</script>

<template>
  <div
    class="route-progress-bar"
    :class="{ 'is-active': progressState === 'active', 'is-done': progressState === 'done' }"
    aria-hidden="true"
  ></div>

  <!--
    While bootstrap() resolves, render nothing rather than flashing a login
    screen that might immediately redirect. Router guards also wait on
    isBootstrapping (see router/index.js) — this is purely to avoid a
    flash of unauthenticated UI, not the actual guard logic.
  -->
  <div v-if="needsBootstrapGate && auth.isBootstrapping" class="min-h-screen flex items-center justify-center bg-slate-50">
    <img src="@/assets/logo.png" alt="Yntra Sparks" class="w-16 h-16 animate-pulse" />
  </div>
  <RouterView v-else v-slot="{ Component, route }">
    <Transition v-bind="routeTransition" mode="out-in" appear>
      <div :key="route.fullPath" class="page-wrapper">
        <component :is="Component" />
      </div>
    </Transition>
  </RouterView>

  <ToastContainer />
  <ConfirmDialog />
</template>

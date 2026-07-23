<script setup>
import KitDetailContent from '@/components/KitDetailContent.vue'
import { useAuthStore } from '@/stores/auth'
import { recentlyViewedStore } from '@/services/recentlyViewedStore'

const props = defineProps({
  id: { type: String, required: true }
})

const auth = useAuthStore()

function handleLoaded(kit) {
  recentlyViewedStore.record(auth.user?.id, kit)
}
</script>

<template>
  <KitDetailContent :kit-id="id" back-route-name="teacher-kits" @loaded="handleLoaded" />
</template>

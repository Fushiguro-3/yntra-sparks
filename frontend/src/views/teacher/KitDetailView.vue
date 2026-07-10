<script setup>
import KitDetailContent from '@/components/KitDetailContent.vue'

defineProps({
  id: { type: String, required: true }
})
</script>

<template>
  <KitDetailContent :kit-id="id" back-route-name="teacher-kits" />
</template>

<script setup>
import Modal from './Modal.vue'
import { useConfirm } from '@/composables/useConfirm'

const { confirmState, accept, decline } = useConfirm()
</script>

<template>
  <Modal :show="confirmState.show" :title="confirmState.title" max-width="max-w-sm" @close="decline">
    <p class="text-sm text-ink-600 leading-relaxed">{{ confirmState.message }}</p>
    <div class="flex justify-end gap-3 mt-6">
      <button type="button" class="app-button-outline" @click="decline">{{ confirmState.cancelLabel }}</button>
      <button
        type="button"
        :class="confirmState.danger ? 'app-button-destructive' : 'app-button-primary'"
        @click="accept"
      >{{ confirmState.confirmLabel }}</button>
    </div>
  </Modal>
</template>

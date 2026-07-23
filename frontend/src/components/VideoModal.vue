<script setup>
import Modal from './Modal.vue'

// Accessible "Watch Demo" video modal: Escape-to-close, focus trap, and
// backdrop click all come from Modal.vue. The iframe only exists in the DOM
// while `show` is true (Modal's own v-if unmounts the slot on close), so
// nothing loads until the user actually opens it, and it never autoplays
// with sound. Uses youtube-nocookie.com (privacy-enhanced mode) and guards
// against a missing/malformed video id rather than rendering a broken embed.
const props = defineProps({
  show: { type: Boolean, default: false },
  videoId: { type: String, default: '' },
  title: { type: String, default: 'Kit demo video' }
})
defineEmits(['close'])

const VALID_ID = /^[a-zA-Z0-9_-]{6,20}$/
</script>

<template>
  <Modal :show="show" :title="title" max-width="max-w-3xl" @close="$emit('close')">
    <div v-if="videoId && VALID_ID.test(videoId)" class="aspect-video rounded-xl overflow-hidden bg-black">
      <iframe
        class="w-full h-full"
        :src="`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`"
        :title="title"
        frameborder="0"
        allow="clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      ></iframe>
    </div>
    <p v-else class="text-sm text-slate-500">This video isn't available right now.</p>
  </Modal>
</template>

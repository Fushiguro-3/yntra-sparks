<script setup>
import { ref } from 'vue'

// Frontend-only avatar upload: validates type/size, decodes the file to
// confirm it's a real image, center-crops to a square, and downsizes to a
// small JPEG before handing the data URL back to the caller. Kept
// deliberately tiny (<=128px, ~q0.75) so it's safe to store in the existing
// profileStore localStorage overlay — see docs for why this was chosen over
// an IndexedDB layer.
const props = defineProps({
  avatarUrl: { type: String, default: '' },
  displayName: { type: String, default: '' }
})
const emit = defineEmits(['change', 'remove'])

const errorMessage = ref('')
const isProcessing = ref(false)

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_RAW_BYTES = 5 * 1024 * 1024
const OUTPUT_SIZE = 128
const OUTPUT_QUALITY = 0.75

function readAsImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error("That file isn't a valid image."))
      img.src = reader.result
    }
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.readAsDataURL(file)
  })
}

function compress(img) {
  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE
  const ctx = canvas.getContext('2d')
  // Center-crop to a square first so downscaling never stretches the image.
  const side = Math.min(img.naturalWidth, img.naturalHeight)
  const sx = (img.naturalWidth - side) / 2
  const sy = (img.naturalHeight - side) / 2
  ctx.drawImage(img, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
  return canvas.toDataURL('image/jpeg', OUTPUT_QUALITY)
}

async function handleFileChange(event) {
  const file = event.target.files?.[0]
  event.target.value = '' // allow re-selecting the same file later
  if (!file) return

  errorMessage.value = ''

  if (!ACCEPTED_TYPES.includes(file.type)) {
    errorMessage.value = 'Please choose a JPG, PNG, or WebP image.'
    return
  }
  if (file.size > MAX_RAW_BYTES) {
    errorMessage.value = 'Image must be 5MB or smaller.'
    return
  }

  isProcessing.value = true
  try {
    const img = await readAsImage(file)
    if (img.naturalWidth < 32 || img.naturalHeight < 32) {
      errorMessage.value = 'Image is too small — please use at least 32×32 pixels.'
      return
    }
    emit('change', compress(img))
  } catch (err) {
    errorMessage.value = err.message || 'Could not process that image.'
  } finally {
    isProcessing.value = false
  }
}

function handleRemove() {
  errorMessage.value = ''
  emit('remove')
}
</script>

<template>
  <div>
    <div class="flex items-center gap-4">
      <div class="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-navy-700 to-navy-900 text-white flex items-center justify-center text-lg font-bold shrink-0" aria-hidden="true">
        <img v-if="avatarUrl" :src="avatarUrl" alt="" class="w-full h-full object-cover">
        <span v-else>{{ (displayName || '?').trim().slice(0, 2).toUpperCase() }}</span>
      </div>
      <div class="flex flex-col gap-2 items-start">
        <label for="avatar-file-input" class="app-button-outline inline-flex cursor-pointer" :class="{ 'opacity-60 pointer-events-none': isProcessing }">
          {{ isProcessing ? 'Processing…' : 'Change photo' }}
        </label>
        <input
          id="avatar-file-input"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="sr-only"
          :disabled="isProcessing"
          aria-describedby="avatar-file-hint"
          @change="handleFileChange"
        >
        <button v-if="avatarUrl" type="button" class="text-xs font-semibold text-red-600 hover:text-red-700" @click="handleRemove">Remove photo</button>
      </div>
    </div>
    <p v-if="errorMessage" class="mt-2 text-xs text-red-600" role="alert">{{ errorMessage }}</p>
    <p id="avatar-file-hint" class="mt-2 text-xs text-ink-600">JPG, PNG, or WebP. Max 5MB — resized automatically.</p>
  </div>
</template>

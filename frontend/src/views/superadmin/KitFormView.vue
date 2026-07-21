<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { kitService } from '@/api/kitService'
import { categoryService } from '@/api/categoryService'
import { schoolService } from '@/api/schoolService'

const props = defineProps({
  id: { type: String, default: null } // present when editing (route param)
})

const router = useRouter()
const isEditing = computed(() => !!props.id)

const categories = ref([])
const schools = ref([])
const selectedSchoolIds = ref(new Set())
const isLoading = ref(true)
const isSaving = ref(false)
const errorMessage = ref('')

const form = ref({
  title: '',
  description: '',
  thumbnailUrl: '',
  manualPdfUrl: '',
  grade: '',
  price: '',
  categoryId: '',
  videos: [] // { title, youtubeVideoId, sequence }
})
const manualFile = ref(null)
const maxManualSizeMb = 50
const maxManualSizeBytes = maxManualSizeMb * 1024 * 1024

function addVideo() {
  form.value.videos.push({
    title: '',
    youtubeVideoId: '',
    sequence: form.value.videos.length + 1
  })
}

function removeVideo(index) {
  form.value.videos.splice(index, 1)
  // Resequence so gaps don't appear after a mid-list removal
  form.value.videos.forEach((v, i) => { v.sequence = i + 1 })
}

function moveVideo(index, direction) {
  const target = index + direction
  if (target < 0 || target >= form.value.videos.length) return
  const videos = form.value.videos
  ;[videos[index], videos[target]] = [videos[target], videos[index]]
  videos.forEach((v, i) => { v.sequence = i + 1 })
}

async function loadCategories() {
  categories.value = await categoryService.list()
}

async function loadSchools() {
  const result = await schoolService.list({ size: 100, sort: 'name,asc' })
  schools.value = result.content.filter((school) => school.status === 'ACTIVE')
}

async function loadAssignedSchools() {
  if (!isEditing.value) return
  const assignedSchools = await kitService.listSchoolsForKit(props.id)
  selectedSchoolIds.value = new Set(assignedSchools.map((school) => school.id))
}

function toggleSchool(schoolId) {
  const next = new Set(selectedSchoolIds.value)
  if (next.has(schoolId)) next.delete(schoolId)
  else next.add(schoolId)
  selectedSchoolIds.value = next
}

async function loadKit() {
  if (!isEditing.value) return
  const kit = await kitService.getById(props.id)
  form.value = {
    title: kit.title,
    description: kit.description || '',
    thumbnailUrl: kit.thumbnailUrl || '',
    manualPdfUrl: kit.manualPdfUrl || '',
    grade: kit.grade || '',
    price: kit.price ?? '',
    categoryId: kit.categoryId ?? kit.category?.id ?? '',
    videos: (kit.videos || []).map((v) => ({ ...v }))
  }
}

function buildPayload() {
  return {
    ...form.value,
    price: form.value.price === '' ? null : Number(form.value.price),
    videos: form.value.videos.map((video, index) => ({
      ...video,
      title: video.title.trim(),
      youtubeVideoId: extractYoutubeVideoId(video.youtubeVideoId.trim()),
      sequence: index + 1
    }))
  }
}

function extractYoutubeVideoId(value) {
  if (!value) return ''

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&?/]+)/i,
    /^[a-zA-Z0-9_-]{11}$/
  ]

  for (const pattern of patterns) {
    const match = value.match(pattern)
    if (match) return match[1] || match[0]
  }

  return value
}

function handleManualFileChange(event) {
  const file = event.target.files?.[0] || null
  manualFile.value = file
  if (file && file.type !== 'application/pdf') {
    errorMessage.value = 'Manual must be a PDF file.'
    manualFile.value = null
    event.target.value = ''
    return
  }
  if (file && file.size > maxManualSizeBytes) {
    errorMessage.value = `Manual PDF must be ${maxManualSizeMb} MB or smaller.`
    manualFile.value = null
    event.target.value = ''
  }
}

async function syncSchoolAccess(kitId) {
  const assignedSchools = await kitService.listSchoolsForKit(kitId)
  const assignedIds = new Set(assignedSchools.map((school) => school.id))
  const selectedIds = selectedSchoolIds.value

  await Promise.all([
    ...[...selectedIds]
      .filter((schoolId) => !assignedIds.has(schoolId))
      .map((schoolId) => kitService.assignToSchool(schoolId, kitId)),
    ...[...assignedIds]
      .filter((schoolId) => !selectedIds.has(schoolId))
      .map((schoolId) => kitService.revokeFromSchool(schoolId, kitId))
  ])
}

async function handleSave() {
  errorMessage.value = ''
  if (!form.value.title.trim() || !form.value.grade.trim() || !form.value.categoryId) {
    errorMessage.value = 'Title, grade, and category are required.'
    return
  }
  const price = Number(form.value.price)
  if (form.value.price === '' || Number.isNaN(price) || price < 0) {
    errorMessage.value = 'Price is required and must be zero or more.'
    return
  }
  if (form.value.videos.some((v) => !v.title.trim() || !extractYoutubeVideoId(v.youtubeVideoId.trim()))) {
    errorMessage.value = 'Every video needs a title and a valid YouTube video URL or ID.'
    return
  }

  isSaving.value = true
  try {
    const payload = buildPayload()
    if (manualFile.value) {
      const manual = await kitService.uploadManual(manualFile.value)
      payload.manualPdfUrl = manual.key
    }
    const savedKit = isEditing.value
      ? await kitService.update(props.id, payload)
      : await kitService.create(payload)
    await syncSchoolAccess(savedKit.id)
    router.push({ name: 'admin-kits' })
  } catch (err) {
    errorMessage.value = err.errors?.map((e) => e.message).join(' ') || err.message
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  isLoading.value = true
  try {
    await Promise.all([loadCategories(), loadSchools(), loadKit(), loadAssignedSchools()])
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="max-w-2xl">
    <div class="mb-6">
      <RouterLink :to="{ name: 'admin-kits' }" class="text-sm text-slate-500 hover:text-slate-700">&larr; Back to Kits</RouterLink>
      <h1 class="app-panel-title text-xl mt-1">{{ isEditing ? 'Edit Kit' : 'Add Kit' }}</h1>
    </div>

    <div v-if="isLoading" class="text-slate-400 text-sm">Loading…</div>

    <form v-else @submit.prevent="handleSave" class="space-y-5">
      <div class="app-surface rounded-[24px] p-6 space-y-4">
        <div>
          <label for="kit-title" class="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input id="kit-title" v-model="form.title" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
        </div>
        <div>
          <label for="kit-description" class="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea id="kit-description" v-model="form.description" rows="3" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"></textarea>
        </div>
        <div>
          <label for="kit-thumbnail" class="block text-sm font-medium text-slate-700 mb-1">Thumbnail URL</label>
          <input id="kit-thumbnail" v-model="form.thumbnailUrl" type="text" placeholder="https://…" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
        </div>
        <div>
          <label for="kit-manual" class="block text-sm font-medium text-slate-700 mb-1">Manual PDF</label>
          <input id="kit-manual" type="file" accept="application/pdf,.pdf" @change="handleManualFileChange" aria-describedby="kit-manual-hint" class="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-500">
          <p id="kit-manual-hint" class="mt-1 text-xs text-slate-400">PDF only, up to {{ maxManualSizeMb }} MB.</p>
          <a
            v-if="form.manualPdfUrl"
            :href="form.manualPdfUrl"
            target="_blank"
            rel="noopener"
            class="inline-block mt-2 text-xs font-semibold text-navy-700 hover:text-navy-900"
          >
            View current manual
          </a>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label for="kit-grade" class="block text-sm font-medium text-slate-700 mb-1">Grade</label>
            <input id="kit-grade" v-model="form.grade" type="text" placeholder="Grade 6" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
          </div>
          <div>
            <label for="kit-price" class="block text-sm font-medium text-slate-700 mb-1">Price (₹)</label>
            <input id="kit-price" v-model="form.price" type="number" min="0" step="0.01" placeholder="0.00" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
          </div>
          <div>
            <label for="kit-category" class="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select id="kit-category" v-model="form.categoryId" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
              <option value="" disabled>Select a category</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="app-surface rounded-[24px] p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-display font-semibold text-slate-800 text-sm">Videos</h2>
          <button type="button" @click="addVideo" class="text-sm font-medium text-navy-600 hover:text-navy-800">+ Add Video</button>
        </div>

        <p v-if="form.videos.length === 0" class="text-sm text-slate-400">No videos added yet.</p>

        <div v-for="(video, index) in form.videos" :key="index" class="flex items-start gap-2 mb-3 last:mb-0">
          <div class="flex flex-col gap-1 pt-2">
            <button type="button" @click="moveVideo(index, -1)" :disabled="index === 0" :aria-label="`Move video ${index + 1} up`" class="text-slate-400 hover:text-slate-700 disabled:opacity-30 text-xs">▲</button>
            <button type="button" @click="moveVideo(index, 1)" :disabled="index === form.videos.length - 1" :aria-label="`Move video ${index + 1} down`" class="text-slate-400 hover:text-slate-700 disabled:opacity-30 text-xs">▼</button>
          </div>
          <div class="flex-1 grid grid-cols-2 gap-2">
            <label :for="`video-title-${index}`" class="sr-only">Video {{ index + 1 }} title</label>
            <input :id="`video-title-${index}`" v-model="video.title" type="text" placeholder="Video title" class="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500">
            <label :for="`video-url-${index}`" class="sr-only">Video {{ index + 1 }} YouTube URL or ID</label>
            <input :id="`video-url-${index}`" v-model="video.youtubeVideoId" type="text" placeholder="YouTube URL or video ID" class="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-500">
          </div>
          <button type="button" @click="removeVideo(index)" :aria-label="`Remove video ${index + 1}`" class="text-red-400 hover:text-red-600 pt-2 text-sm">&times;</button>
        </div>
      </div>

      <div class="app-surface rounded-[24px] p-6">
        <div class="mb-4">
          <h2 class="font-display font-semibold text-slate-800 text-sm">School access</h2>
          <p class="text-sm text-slate-500 mt-1">Select the schools whose principals and teachers can see this kit.</p>
        </div>

        <div v-if="schools.length" class="max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl px-4">
          <label v-for="school in schools" :key="school.id" class="flex items-center gap-3 py-3 cursor-pointer">
            <input
              type="checkbox"
              :checked="selectedSchoolIds.has(school.id)"
              @change="toggleSchool(school.id)"
              class="h-4 w-4 rounded border-slate-300 text-navy-700 focus:ring-navy-500"
            >
            <span class="text-sm text-slate-700">{{ school.name }}</span>
          </label>
        </div>
        <p v-else class="text-sm text-slate-400">No active schools are available to assign.</p>
      </div>

      <p v-if="errorMessage" role="alert" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ errorMessage }}</p>

      <div class="flex flex-wrap justify-end gap-2">
        <RouterLink :to="{ name: 'admin-kits' }" class="app-button-quiet">Cancel</RouterLink>
        <button type="submit" :disabled="isSaving" class="app-button-primary disabled:opacity-60">
          {{ isSaving ? 'Saving…' : 'Save Kit' }}
        </button>
      </div>
    </form>
  </div>
</template>

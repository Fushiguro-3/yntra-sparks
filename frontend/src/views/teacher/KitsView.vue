<script setup>
import { ref, onMounted } from 'vue'
import { kitService } from '@/api/kitService'
import Pagination from '@/components/Pagination.vue'

const kits = ref([])
const page = ref(0)
const totalPages = ref(0)
const isLoading = ref(true)
const errorMessage = ref('')

async function loadKits() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await kitService.listForMySchool({ page: page.value })
    kits.value = res.content
    totalPages.value = res.totalPages
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isLoading.value = false
  }
}

function onPageChange(newPage) {
  page.value = newPage
  loadKits()
}

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return ''
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(price))
}

onMounted(loadKits)
</script>

<template>
  <div>
    <div class="dashboard-hero rounded-[28px] px-6 py-7 md:px-8 mb-7">
      <p class="text-xs font-bold uppercase tracking-[.18em] text-spark-300 mb-2">Ready to explore?</p>
      <h1 class="font-display text-2xl md:text-3xl font-bold">My learning kit library</h1>
      <p class="text-slate-500 text-sm">Kits your school has purchased — pick one to start a video.</p>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
      {{ errorMessage }}
    </p>
    <p v-if="!isLoading && kits.length === 0 && !errorMessage" class="text-sm text-slate-400">
      No kits assigned to your school yet — contact Yntra Sparks to get started.
    </p>

    <div v-if="isLoading" class="text-slate-400 text-sm">Loading…</div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <RouterLink
        v-for="kit in kits"
        :key="kit.id"
        :to="{ name: 'teacher-kit-detail', params: { id: kit.id } }"
        class="kit-dashboard-card bg-white rounded-[22px] border border-navy-100 overflow-hidden transition duration-300 group"
      >
        <div class="aspect-video accent-grid flex items-center justify-center overflow-hidden">
          <img v-if="kit.thumbnailUrl" :src="kit.thumbnailUrl" :alt="kit.title" class="w-full h-full object-cover">
          <span v-else class="text-slate-300 text-3xl">🧪</span>
        </div>
        <div class="p-4">
          <p class="text-xs text-spark-600 font-semibold mb-1">{{ kit.categoryName ?? kit.category?.name ?? 'Uncategorized' }}</p>
          <h3 class="font-display font-semibold text-navy-900 group-hover:text-spark-600 transition">{{ kit.title }}</h3>
          <div class="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            <span v-if="kit.grade" class="rounded-md bg-slate-100 px-2 py-1">{{ kit.grade }}</span>
            <span v-if="kit.price !== null && kit.price !== undefined" class="rounded-md bg-slate-100 px-2 py-1">{{ formatPrice(kit.price) }}</span>
          </div>
        </div>
      </RouterLink>
    </div>

    <Pagination :page="page" :total-pages="totalPages" @change="onPageChange" />
  </div>
</template>

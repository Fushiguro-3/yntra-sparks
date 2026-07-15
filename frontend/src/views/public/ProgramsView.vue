<script setup>
import { computed, onMounted, ref } from 'vue'
import { publicService } from '@/api/publicService'

const kits = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

const programs = computed(() => {
  return kits.value.reduce((groups, kit) => {
    const category = kit.categoryName || 'STEM Kits'
    if (!groups[category]) groups[category] = []
    groups[category].push(kit)
    return groups
  }, {})
})

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return ''
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(price))
}

async function loadKits() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await publicService.listKits({ size: 24 })
    kits.value = res.content || []
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isLoading.value = false
  }
}

onMounted(loadKits)
</script>

<template>
  <section class="max-w-[1440px] mx-auto px-5 md:px-10 pt-16 pb-20">
    <div class="text-center mb-12" data-aos="fade-up">
      <h1 class="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-3">Programs</h1>
      <p class="text-ink-600 max-w-lg mx-auto">Browse real kit programs from the catalog, organized by STEM category.</p>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">{{ errorMessage }}</p>
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-5">
      <div v-for="item in 3" :key="item" class="bg-white rounded-[24px] p-5 kit-card-fun">
        <div class="skeleton aspect-[16/10] mb-5"></div><div class="skeleton h-3 w-20 mb-3"></div><div class="skeleton h-6 w-3/4 mb-3"></div><div class="skeleton h-3 w-full"></div>
      </div>
    </div>
    <div v-else-if="kits.length === 0" class="empty-state app-surface rounded-[24px]">No programs are available yet. Check back soon for new learning adventures.</div>

    <div v-else class="space-y-12">
      <section v-for="(items, category) in programs" :key="category">
        <div class="flex items-end justify-between gap-4 mb-5" data-aos="fade-up">
          <div>
            <h2 class="font-display text-xl font-semibold text-navy-900">{{ category }}</h2>
            <p class="text-sm text-ink-600 mt-1">{{ items.length }} kit{{ items.length === 1 ? '' : 's' }} available</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
          <article
            v-for="(kit, index) in items"
            :key="kit.id"
            class="group bg-white rounded-[24px] overflow-hidden kit-card-fun hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200"
            data-aos="zoom-pop"
            :style="{ '--aos-delay': `${index * 130}ms` }"
          >
            <div class="aspect-[16/10] bg-gradient-to-br from-white to-navy-50 overflow-hidden p-4 relative">
              <span class="absolute -left-8 bottom-2 w-20 h-16 blue-splash opacity-80"></span>
              <span class="absolute -right-8 top-3 w-20 h-16 orange-splash opacity-80"></span>
              <img v-if="kit.thumbnailUrl" :src="kit.thumbnailUrl" :alt="kit.title" loading="lazy" class="relative z-10 w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-110">
            </div>
            <div class="p-5">
              <p class="text-xs font-semibold text-spark-600 mb-1">{{ kit.grade }}</p>
              <h3 class="font-display font-medium text-lg text-navy-900">{{ kit.title }}</h3>
              <p class="text-sm text-ink-600 mt-2">{{ kit.description }}</p>
              <div class="flex flex-wrap gap-2 mt-4 text-xs text-slate-600">
                <span class="rounded-md bg-slate-100 px-2 py-1">{{ formatPrice(kit.price) }}</span>
                <RouterLink
                  :to="{ name: 'public-kit-detail', params: { id: kit.id } }"
                  class="rounded-md bg-navy-50 px-2 py-1 font-semibold text-navy-700 hover:bg-navy-100"
                >
                  Explore Kit
                </RouterLink>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  </section>
</template>

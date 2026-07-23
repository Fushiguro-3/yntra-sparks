<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { categoryService } from '@/api/categoryService'
import { publicService } from '@/api/publicService'
import { imageForCategory } from '@/utils/categoryImages'
import { blurbForCategory } from '@/utils/categoryBlurbs'
import { buildKitContext } from '@/utils/kitNavContext'
import ExploreKitButton from '@/components/public/ExploreKitButton.vue'

// Sourced live from categoryService — the same service Super Admin's
// Categories page (src/views/superadmin/CategoriesView.vue) writes
// through, and in mock mode both read the same in-memory array, so
// changes made there show up here immediately without a page reload.
const route = useRoute()
const router = useRouter()

const categories = ref([])
const kits = ref([])
const isLoading = ref(true)
const isLoadingKits = ref(false)
const errorMessage = ref('')
const kitsErrorMessage = ref('')

const selectedCategoryId = computed(() => (route.query.category ? String(route.query.category) : ''))
const selectedCategory = computed(() =>
  categories.value.find((c) => String(c.id) === selectedCategoryId.value) || null
)
// Selection is "invalid" once categories have loaded successfully but the
// requested id doesn't match any of them — never before categories/kits
// have actually loaded, which would otherwise flash a false "not found".
const isInvalidSelection = computed(() =>
  !isLoading.value && !errorMessage.value && !!selectedCategoryId.value && !selectedCategory.value
)

const categoryCards = computed(() => categories.value.map((cat) => ({
  id: cat.id,
  name: cat.name,
  blurb: blurbForCategory(cat.name),
  image: imageForCategory(cat.name),
  kitCount: kits.value.filter((k) => k.categoryId === cat.id).length
})))

const kitsForSelectedCategory = computed(() => {
  if (!selectedCategory.value) return []
  return kits.value.filter((k) => k.categoryId === selectedCategory.value.id)
})

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return ''
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(price))
}

function clearCategory() {
  router.push({ name: 'public-categories' })
}

async function loadCategories() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    categories.value = await categoryService.list()
  } catch (err) {
    errorMessage.value = err.message || 'Could not load categories.'
  } finally {
    isLoading.value = false
  }
}

async function loadKits() {
  isLoadingKits.value = true
  kitsErrorMessage.value = ''
  try {
    const res = await publicService.listKits({ size: 100 })
    kits.value = res.content || []
  } catch (err) {
    kitsErrorMessage.value = err.message || 'Could not load kits.'
  } finally {
    isLoadingKits.value = false
  }
}

onMounted(() => {
  loadCategories()
  loadKits()
})
</script>

<template>
  <section class="max-w-[1440px] mx-auto px-5 md:px-10 pt-16 pb-20">

    <!-- No category selected — show all category cards -->
    <template v-if="!selectedCategoryId">
      <div class="text-center mb-12" data-aos="fade-up">
        <h1 class="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-3">Explore by Category</h1>
        <p class="text-ink-600 max-w-lg mx-auto">Every kit belongs to a category — pick one to see what's inside.</p>
      </div>

      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" role="status" aria-label="Loading categories">
        <div v-for="n in 4" :key="n" class="bg-white rounded-[24px] p-6 kit-card-fun animate-pulse">
          <div class="w-full aspect-square rounded-[18px] mb-4 bg-slate-100"></div>
          <div class="h-4 w-2/3 bg-slate-100 rounded mb-2"></div>
          <div class="h-3 w-full bg-slate-100 rounded"></div>
        </div>
      </div>

      <div v-else-if="errorMessage" class="text-center app-surface rounded-[24px] p-10 max-w-md mx-auto">
        <p class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{{ errorMessage }}</p>
        <button @click="loadCategories" class="app-button-primary">Try again</button>
      </div>

      <div v-else-if="categories.length === 0" class="text-center app-surface rounded-[24px] p-10 max-w-md mx-auto">
        <p class="text-ink-600">No categories have been added yet — check back soon.</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <RouterLink
          v-for="(cat, index) in categoryCards"
          :key="cat.id"
          :to="{ name: 'public-categories', query: { category: cat.id } }"
          class="group bg-white rounded-[24px] p-6 kit-card-fun hover-glow hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-400"
          data-aos="fade-up"
          :style="{ '--aos-delay': `${index * 40}ms` }"
        >
          <div class="w-full aspect-square rounded-[18px] mb-4 overflow-hidden">
            <img
              :src="cat.image"
              :alt="`${cat.name} illustration`"
              loading="lazy"
              class="w-full h-full object-cover transition-transform duration-[420ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.12]"
            />
          </div>
          <h3 class="font-display font-medium text-lg text-navy-900">{{ cat.name }}</h3>
          <p class="text-sm text-ink-600 mt-1 line-clamp-2">{{ cat.blurb }}</p>
          <p v-if="cat.kitCount > 0" class="text-xs font-semibold text-spark-600 mt-2">{{ cat.kitCount }} kit{{ cat.kitCount === 1 ? '' : 's' }}</p>
        </RouterLink>
      </div>
    </template>

    <!-- Unknown/invalid ?category= id -->
    <template v-else-if="isInvalidSelection">
      <div class="text-center app-surface rounded-[24px] p-10 max-w-md mx-auto">
        <p class="font-display font-medium text-navy-900 mb-1">Category not found</p>
        <p class="text-sm text-ink-600 mb-5">That category may have been renamed or removed.</p>
        <button @click="clearCategory" class="app-button-primary">Back to Categories</button>
      </div>
    </template>

    <!-- Category selected — show its kits -->
    <template v-else-if="selectedCategory">
      <div class="mb-8" data-aos="fade-up">
        <button
          @click="clearCategory"
          class="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-navy-800 transition mb-5"
        >
          &larr; All Categories
        </button>
        <h1 class="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-2">{{ selectedCategory.name }}</h1>
        <p class="text-ink-600 text-sm">{{ blurbForCategory(selectedCategory.name) }}</p>
      </div>

      <div v-if="kitsErrorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4 flex items-center justify-between gap-3">
        <span>{{ kitsErrorMessage }}</span>
        <button type="button" class="app-button-outline shrink-0" @click="loadKits">Retry</button>
      </div>

      <div v-if="isLoadingKits" class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div v-for="item in 3" :key="item" class="bg-white rounded-[24px] p-5 kit-card-fun">
          <div class="skeleton aspect-[16/10] mb-5"></div>
          <div class="skeleton h-5 w-2/3 mb-3"></div>
          <div class="skeleton h-3 w-full"></div>
        </div>
      </div>

      <div v-else-if="kitsForSelectedCategory.length === 0" class="empty-state app-surface rounded-[24px]">
        No kits are available in {{ selectedCategory.name }} yet.
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        <article
          v-for="(kit, index) in kitsForSelectedCategory"
          :key="kit.id"
          class="group h-full flex flex-col bg-white rounded-[24px] overflow-hidden kit-card-fun hover-glow hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200"
          data-aos="fade-up"
          :style="{ '--aos-delay': `${index * 40}ms` }"
        >
          <div class="aspect-[16/10] shrink-0 bg-gradient-to-br from-white to-spark-50 overflow-hidden p-4 relative">
            <span class="absolute -left-8 top-3 w-20 h-16 blue-splash opacity-80"></span>
            <span class="absolute -right-8 bottom-3 w-20 h-16 orange-splash opacity-80"></span>
            <img v-if="kit.thumbnailUrl" :src="kit.thumbnailUrl" :alt="kit.title" loading="lazy" class="relative z-10 w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-110">
          </div>
          <div class="p-5 flex-1 flex flex-col">
            <p class="text-xs font-semibold text-spark-600 mb-1 line-clamp-1">{{ kit.grade }}</p>
            <h3 class="font-display font-medium text-lg text-navy-900 line-clamp-1">{{ kit.title }}</h3>
            <p class="text-sm text-ink-600 mt-2 line-clamp-2">{{ kit.description }}</p>
            <div class="flex flex-wrap items-center gap-2 mt-4 mb-4 text-xs text-slate-600">
              <span class="rounded-md bg-slate-100 px-2 py-1">{{ formatPrice(kit.price) }}</span>
            </div>
            <ExploreKitButton
              :to="{ name: 'public-kit-detail', params: { id: kit.id }, query: buildKitContext('category', selectedCategory.id, selectedCategory.name) }"
              size="sm"
              block
              class="mt-auto"
            />
          </div>
        </article>
      </div>
    </template>

  </section>
</template>

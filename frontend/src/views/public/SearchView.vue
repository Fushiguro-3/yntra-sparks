<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { publicService } from '@/api/publicService'
import ExploreKitButton from '@/components/public/ExploreKitButton.vue'
import { buildKitContext } from '@/utils/kitNavContext'

// Client-side search over the full public catalog (same "fetch a larger
// batch, filter in the component" trick Programs/Categories already use —
// there's no server-side search endpoint, and this dataset is small enough
// that it doesn't need one). Filters are Grade and Category — the two real
// distinct facets kits actually carry; "Program" isn't tracked as a
// separate field in the data model (the Programs page is itself just kits
// grouped by category), so it isn't offered as a third, redundant filter.
const SORTS = ['relevance', 'name', 'newest']

const route = useRoute()
const router = useRouter()

const allKits = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

function initialQueryValue(key) {
  const value = route.query[key]
  return typeof value === 'string' ? value : ''
}

const q = ref(initialQueryValue('q'))
const grade = ref(initialQueryValue('grade'))
const category = ref(initialQueryValue('category'))
const initialSort = initialQueryValue('sort')
const sort = ref(SORTS.includes(initialSort) ? initialSort : 'relevance')

const grades = computed(() => [...new Set(allKits.value.map((k) => k.grade).filter(Boolean))].sort())
const categories = computed(() => [...new Set(allKits.value.map((k) => k.categoryName).filter(Boolean))].sort())

const hasActiveFilters = computed(() => !!(q.value || grade.value || category.value || sort.value !== 'relevance'))

const results = computed(() => {
  const query = q.value.trim().toLowerCase()
  let list = allKits.value.filter((kit) => {
    if (grade.value && kit.grade !== grade.value) return false
    if (category.value && kit.categoryName !== category.value) return false
    if (query) {
      const haystack = `${kit.title} ${kit.description} ${kit.grade} ${kit.categoryName}`.toLowerCase()
      if (!haystack.includes(query)) return false
    }
    return true
  })

  if (sort.value === 'name') {
    list = [...list].sort((a, b) => a.title.localeCompare(b.title))
  } else if (sort.value === 'newest') {
    list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  } else if (query) {
    // "Relevance": title-starts-with matches float to the top; otherwise
    // keep catalog order rather than inventing a scoring model.
    list = [...list].sort((a, b) => {
      const aStarts = a.title.toLowerCase().startsWith(query) ? 0 : 1
      const bStarts = b.title.toLowerCase().startsWith(query) ? 0 : 1
      return aStarts - bStarts
    })
  }
  return list
})

// Kept in the URL so results are shareable and survive a refresh; uses
// replace (not push) so adjusting filters doesn't spam browser history.
function syncQuery() {
  const query = {}
  if (q.value) query.q = q.value
  if (grade.value) query.grade = grade.value
  if (category.value) query.category = category.value
  if (sort.value !== 'relevance') query.sort = sort.value
  router.replace({ name: 'public-search', query })
}
watch([q, grade, category, sort], syncQuery)

function clearFilters() {
  q.value = ''
  grade.value = ''
  category.value = ''
  sort.value = 'relevance'
}

async function loadKits() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await publicService.listKits({ size: 200 })
    allKits.value = res.content || []
  } catch (err) {
    errorMessage.value = err.message || 'Could not load kits.'
  } finally {
    isLoading.value = false
  }
}

// The exact current query string, so "Search → Kit → Back" restores this
// precise search rather than a generic "back to search".
const searchContextValue = computed(() => {
  const params = new URLSearchParams()
  if (q.value) params.set('q', q.value)
  if (grade.value) params.set('grade', grade.value)
  if (category.value) params.set('category', category.value)
  if (sort.value !== 'relevance') params.set('sort', sort.value)
  return params.toString()
})

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return ''
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(price))
}

onMounted(loadKits)
</script>

<template>
  <section class="max-w-[1440px] mx-auto px-5 md:px-10 pt-16 pb-20">
    <div class="text-center mb-10" data-aos="fade-up">
      <h1 class="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-3">Search Kits</h1>
      <p class="text-ink-600 max-w-lg mx-auto">Find the right hands-on kit by keyword, grade, or category.</p>
    </div>

    <div class="app-surface rounded-[24px] p-5 sm:p-6 mb-8">
      <label for="search-q" class="sr-only">Search kits</label>
      <input
        id="search-q"
        v-model="q"
        type="search"
        class="app-input mb-4"
        placeholder="Search by name, description, grade, or category…"
      >
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label for="search-grade" class="block text-xs font-semibold uppercase tracking-wide text-ink-600 mb-1">Grade</label>
          <select id="search-grade" v-model="grade" class="app-input">
            <option value="">All grades</option>
            <option v-for="g in grades" :key="g" :value="g">{{ g }}</option>
          </select>
        </div>
        <div>
          <label for="search-category" class="block text-xs font-semibold uppercase tracking-wide text-ink-600 mb-1">Category</label>
          <select id="search-category" v-model="category" class="app-input">
            <option value="">All categories</option>
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>
        <div>
          <label for="search-sort" class="block text-xs font-semibold uppercase tracking-wide text-ink-600 mb-1">Sort by</label>
          <select id="search-sort" v-model="sort" class="app-input">
            <option value="relevance">Relevance</option>
            <option value="name">Name (A–Z)</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>
      <button v-if="hasActiveFilters" type="button" class="text-sm font-semibold text-navy-700 hover:text-navy-900 mt-4" @click="clearFilters">
        Clear filters
      </button>
    </div>

    <div v-if="errorMessage" class="text-center app-surface rounded-[24px] p-10 max-w-md mx-auto">
      <p class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">{{ errorMessage }}</p>
      <button @click="loadKits" class="app-button-primary">Try again</button>
    </div>

    <div v-else-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-5" role="status" aria-label="Searching kits">
      <div v-for="n in 3" :key="n" class="bg-white rounded-[24px] p-5 kit-card-fun">
        <div class="skeleton aspect-[16/10] mb-5"></div>
        <div class="skeleton h-5 w-2/3 mb-3"></div>
        <div class="skeleton h-3 w-full"></div>
      </div>
    </div>

    <div v-else-if="results.length === 0" class="text-center app-surface rounded-[24px] p-10 max-w-md mx-auto">
      <p class="text-ink-600 mb-4">No kits match your search.</p>
      <button v-if="hasActiveFilters" @click="clearFilters" class="app-button-primary">Clear filters</button>
    </div>

    <template v-else>
      <p class="text-sm text-ink-600 mb-5">{{ results.length }} kit{{ results.length === 1 ? '' : 's' }} found</p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        <article
          v-for="(kit, index) in results"
          :key="kit.id"
          class="group h-full flex flex-col bg-white rounded-[24px] overflow-hidden kit-card-fun hover-glow hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200"
          data-aos="fade-up"
          :style="{ '--aos-delay': `${Math.min(index, 8) * 30}ms` }"
        >
          <div class="aspect-[16/10] shrink-0 bg-gradient-to-br from-white to-spark-50 overflow-hidden p-4 relative">
            <span class="absolute -left-8 top-3 w-20 h-16 blue-splash opacity-80"></span>
            <span class="absolute -right-8 bottom-3 w-20 h-16 orange-splash opacity-80"></span>
            <img v-if="kit.thumbnailUrl" :src="kit.thumbnailUrl" :alt="kit.title" loading="lazy" class="relative z-10 w-full h-full object-contain transition-transform duration-500 ease-out group-hover:scale-110">
          </div>
          <div class="p-5 flex-1 flex flex-col">
            <p class="text-xs font-semibold text-spark-600 mb-1 line-clamp-1">{{ kit.categoryName || 'STEM Kit' }}</p>
            <h3 class="font-display font-medium text-lg text-navy-900 line-clamp-1">{{ kit.title }}</h3>
            <p class="text-sm text-ink-600 mt-2 line-clamp-2">{{ kit.description }}</p>
            <div class="flex flex-wrap items-center gap-2 mt-4 mb-4 text-xs text-slate-600">
              <span v-if="kit.grade" class="rounded-md bg-slate-100 px-2 py-1">{{ kit.grade }}</span>
              <span class="rounded-md bg-slate-100 px-2 py-1">{{ formatPrice(kit.price) }}</span>
            </div>
            <ExploreKitButton
              :to="{ name: 'public-kit-detail', params: { id: kit.id }, query: buildKitContext('search', searchContextValue) }"
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

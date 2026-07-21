<script setup>
import { onMounted, ref } from 'vue'
import { categoryService } from '@/api/categoryService'
import { imageForCategory } from '@/utils/categoryImages'

// Sourced live from categoryService — the same service Super Admin's
// Categories page (src/views/superadmin/CategoriesView.vue) writes
// through, and in mock mode both read the same in-memory array, so
// changes made there show up here immediately without a page reload.
const categories = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

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

onMounted(loadCategories)
</script>

<template>
  <section class="max-w-[1440px] mx-auto px-5 md:px-10 pt-16 pb-20">
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
      <div
        v-for="(cat, index) in categories"
        :key="cat.id"
        class="group bg-white rounded-[24px] p-6 kit-card-fun hover-glow hover:-translate-y-1 hover:scale-[1.02] transition-all duration-200"
        data-aos="fade-up"
        :style="{ '--aos-delay': `${index * 115}ms` }"
      >
        <div class="w-full aspect-square rounded-[18px] mb-4 overflow-hidden">
          <img
            :src="imageForCategory(cat.name)"
            :alt="`${cat.name} illustration`"
            loading="lazy"
            class="w-full h-full object-cover transition-transform duration-[760ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.12]"
          />
        </div>
        <h3 class="font-display font-medium text-lg text-navy-900">{{ cat.name }}</h3>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { categoryService } from '@/api/categoryService'
import Modal from '@/components/Modal.vue'
import PageHeader from '@/components/PageHeader.vue'
import AppButton from '@/components/AppButton.vue'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'

const toast = useToast()
const { confirm } = useConfirm()

const categories = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

const showModal = ref(false)
const editingId = ref(null)
const name = ref('')
const formError = ref('')
const isSaving = ref(false)

async function loadCategories() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    categories.value = await categoryService.list()
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isLoading.value = false
  }
}

function openCreate() {
  editingId.value = null
  name.value = ''
  formError.value = ''
  showModal.value = true
}

function openEdit(category) {
  editingId.value = category.id
  name.value = category.name
  formError.value = ''
  showModal.value = true
}

async function saveCategory() {
  if (!name.value.trim()) {
    formError.value = 'Name is required.'
    return
  }
  isSaving.value = true
  formError.value = ''
  try {
    if (editingId.value) {
      await categoryService.update(editingId.value, name.value)
      toast.success('Category updated.')
    } else {
      await categoryService.create(name.value)
      toast.success('Category added.')
    }
    showModal.value = false
    await loadCategories()
  } catch (err) {
    // 409 on duplicate name surfaces here
    formError.value = err.message
  } finally {
    isSaving.value = false
  }
}

async function removeCategory(category) {
  const confirmed = await confirm({
    title: 'Delete category?',
    message: `Delete category "${category.name}"? This only works if no kits reference it.`,
    confirmLabel: 'Delete',
    danger: true
  })
  if (!confirmed) return
  errorMessage.value = ''
  try {
    await categoryService.remove(category.id)
    toast.success('Category deleted.')
    await loadCategories()
  } catch (err) {
    // Backend blocks with 409 if a Kit still references this category
    errorMessage.value = err.message
    toast.error(err.message)
  }
}

onMounted(loadCategories)
</script>

<template>
  <div>
    <PageHeader eyebrow="Catalog setup" title="Categories" subtitle="Organize kits by subject area.">
      <AppButton @click="openCreate">+ Add Category</AppButton>
    </PageHeader>

    <p v-if="errorMessage" role="alert" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
      {{ errorMessage }}
    </p>

    <div class="app-surface rounded-[22px] overflow-hidden">
      <div class="overflow-x-auto">
      <table class="app-data-table w-full min-w-[440px] text-sm">
        <thead class="bg-slate-50 text-left text-slate-500">
          <tr>
            <th class="px-5 py-3 font-medium">Name</th>
            <th class="px-5 py-3 font-medium text-right w-[150px]">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="isLoading">
            <td colspan="2" class="px-5 py-6 text-center text-slate-400">Loading…</td>
          </tr>
          <tr v-else-if="categories.length === 0">
            <td colspan="2" class="px-5 py-6 text-center text-slate-400">No categories yet.</td>
          </tr>
          <tr v-for="category in categories" :key="category.id" class="hover:bg-slate-50">
            <td class="px-5 py-3 font-medium text-slate-800">{{ category.name }}</td>
            <td class="px-5 py-3">
              <div class="flex items-center justify-end gap-3 whitespace-nowrap">
              <button @click="openEdit(category)" class="text-navy-600 hover:text-navy-800 font-medium">Edit</button>
              <button @click="removeCategory(category)" class="text-red-500 hover:text-red-700 font-medium">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <Modal :show="showModal" :title="editingId ? 'Edit Category' : 'Add Category'" @close="showModal = false">
      <form @submit.prevent="saveCategory" class="space-y-4">
        <div>
          <label for="category-name" class="block text-sm font-medium text-slate-700 mb-1">Category Name</label>
          <input id="category-name" v-model="name" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
        </div>
        <Transition name="field-message">
          <p v-if="formError" role="alert" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ formError }}</p>
        </Transition>
        <div class="flex flex-wrap justify-end gap-2 pt-2">
          <AppButton type="button" variant="quiet" @click="showModal = false">Cancel</AppButton>
          <AppButton type="submit" :loading="isSaving">{{ isSaving ? 'Saving…' : 'Save' }}</AppButton>
        </div>
      </form>
    </Modal>
  </div>
</template>

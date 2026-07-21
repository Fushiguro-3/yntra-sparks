<script setup>
import { ref, onMounted } from 'vue'
import { schoolService } from '@/api/schoolService'
import Modal from '@/components/Modal.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import Pagination from '@/components/Pagination.vue'
import PageHeader from '@/components/PageHeader.vue'
import AppButton from '@/components/AppButton.vue'

const schools = ref([])
const page = ref(0)
const totalPages = ref(0)
const isLoading = ref(true)
const errorMessage = ref('')

const showModal = ref(false)
const editingId = ref(null) // null = create mode
const form = ref({ name: '', email: '', address: '' })
const formError = ref('')
const isSaving = ref(false)

async function loadSchools() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await schoolService.list({ page: page.value })
    schools.value = res.content
    totalPages.value = res.totalPages
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isLoading.value = false
  }
}

function openCreate() {
  editingId.value = null
  form.value = { name: '', email: '', address: '' }
  formError.value = ''
  showModal.value = true
}

function openEdit(school) {
  editingId.value = school.id
  form.value = { name: school.name, email: school.email, address: school.address || '' }
  formError.value = ''
  showModal.value = true
}

async function saveSchool() {
  if (!form.value.name.trim() || !form.value.email.trim()) {
    formError.value = 'Name and email are required.'
    return
  }
  isSaving.value = true
  formError.value = ''
  try {
    if (editingId.value) {
      await schoolService.update(editingId.value, form.value)
    } else {
      await schoolService.create(form.value)
    }
    showModal.value = false
    await loadSchools()
  } catch (err) {
    formError.value = err.message
  } finally {
    isSaving.value = false
  }
}

async function toggleStatus(school) {
  const next = school.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
  if (next === 'INACTIVE' && !confirm(`Deactivate ${school.name}? Its principals and teachers will lose access immediately.`)) return
  try {
    await schoolService.setStatus(school.id, next)
    await loadSchools()
  } catch (err) {
    errorMessage.value = err.message
  }
}

function onPageChange(newPage) {
  page.value = newPage
  loadSchools()
}

onMounted(loadSchools)
</script>

<template>
  <div>
    <PageHeader eyebrow="Workspace directory" title="Schools" subtitle="Onboard and manage school accounts.">
      <AppButton @click="openCreate">+ Add School</AppButton>
    </PageHeader>

    <p v-if="errorMessage" role="alert" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
      {{ errorMessage }}
    </p>

    <div class="app-surface rounded-[22px] overflow-hidden">
      <div class="overflow-x-auto">
      <table class="app-data-table w-full min-w-[620px] text-sm">
        <thead class="bg-slate-50 text-left text-slate-500">
          <tr>
            <th class="px-5 py-3 font-medium">Name</th>
            <th class="px-5 py-3 font-medium">Email</th>
            <th class="px-5 py-3 font-medium">Status</th>
            <th class="px-5 py-3 font-medium text-right w-[190px]">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="isLoading">
            <td colspan="4" class="px-5 py-6 text-center text-slate-400">Loading…</td>
          </tr>
          <tr v-else-if="schools.length === 0">
            <td colspan="4" class="px-5 py-6 text-center text-slate-400">No schools yet.</td>
          </tr>
          <tr v-for="school in schools" :key="school.id" class="hover:bg-slate-50">
            <td class="px-5 py-3 font-medium text-slate-800">{{ school.name }}</td>
            <td class="px-5 py-3 text-slate-500">{{ school.email }}</td>
            <td class="px-5 py-3"><StatusBadge :status="school.status" /></td>
            <td class="px-5 py-3">
              <div class="flex items-center justify-end gap-3 whitespace-nowrap">
              <button @click="openEdit(school)" class="text-navy-600 hover:text-navy-800 font-medium">Edit</button>
              <button @click="toggleStatus(school)" class="text-slate-500 hover:text-slate-800 font-medium">
                {{ school.status === 'ACTIVE' ? 'Deactivate' : 'Activate' }}
              </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <Pagination :page="page" :total-pages="totalPages" @change="onPageChange" />

    <Modal :show="showModal" :title="editingId ? 'Edit School' : 'Add School'" @close="showModal = false">
      <form @submit.prevent="saveSchool" class="space-y-4">
        <div>
          <label for="school-name" class="block text-sm font-medium text-slate-700 mb-1">School Name</label>
          <input id="school-name" v-model="form.name" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
        </div>
        <div>
          <label for="school-email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input id="school-email" v-model="form.email" type="email" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
        </div>
        <div>
          <label for="school-address" class="block text-sm font-medium text-slate-700 mb-1">Address</label>
          <textarea id="school-address" v-model="form.address" rows="2" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500"></textarea>
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

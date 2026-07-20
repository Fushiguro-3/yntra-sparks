<script setup>
import { ref, onMounted, watch } from 'vue'
import { principalService } from '@/api/principalService'
import { schoolService } from '@/api/schoolService'
import Modal from '@/components/Modal.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import Pagination from '@/components/Pagination.vue'

const schools = ref([])
const selectedSchoolId = ref(null)
const principals = ref([])
const page = ref(0)
const totalPages = ref(0)
const isLoading = ref(false)
const errorMessage = ref('')

const showAddModal = ref(false)
const addForm = ref({ name: '', email: '' })
const addError = ref('')
const isSaving = ref(false)

const showPasswordModal = ref(false)
const revealedPassword = ref('')
const revealedFor = ref('')

async function loadSchools() {
  try {
    const res = await schoolService.list({ size: 100, sort: 'name,asc' })
    schools.value = res.content.filter((s) => s.status === 'ACTIVE')
    if (schools.value.length > 0) {
      selectedSchoolId.value = schools.value[0].id
    }
  } catch (err) {
    errorMessage.value = err.message
  }
}

async function loadPrincipals() {
  if (!selectedSchoolId.value) return
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await principalService.list(selectedSchoolId.value, { page: page.value })
    principals.value = res.content
    totalPages.value = res.totalPages
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isLoading.value = false
  }
}

watch(selectedSchoolId, () => {
  page.value = 0
  loadPrincipals()
})

function openAddModal() {
  addForm.value = { name: '', email: '' }
  addError.value = ''
  showAddModal.value = true
}

async function savePrincipal() {
  if (!addForm.value.name.trim() || !addForm.value.email.trim()) {
    addError.value = 'Name and email are required.'
    return
  }
  isSaving.value = true
  addError.value = ''
  try {
    const { tempPassword } = await principalService.create(selectedSchoolId.value, addForm.value)
    showAddModal.value = false
    revealedPassword.value = tempPassword
    revealedFor.value = addForm.value.name
    showPasswordModal.value = true
    await loadPrincipals()
  } catch (err) {
    addError.value = err.message
  } finally {
    isSaving.value = false
  }
}

async function deactivatePrincipal(principal) {
  if (!confirm(`Deactivate ${principal.name}? They'll lose access immediately.`)) return
  errorMessage.value = ''
  try {
    await principalService.deactivate(selectedSchoolId.value, principal.id)
    await loadPrincipals()
  } catch (err) {
    errorMessage.value = err.message
  }
}

async function activatePrincipal(principal) {
  if (!confirm(`Activate ${principal.name}? They'll be able to sign in again.`)) return
  errorMessage.value = ''
  try {
    await principalService.activate(selectedSchoolId.value, principal.id)
    await loadPrincipals()
  } catch (err) {
    errorMessage.value = err.message
  }
}

async function resetPassword(principal) {
  if (!confirm(`Reset password for ${principal.name}? Their old password will stop working immediately.`)) return
  errorMessage.value = ''
  try {
    const { tempPassword } = await principalService.resetPassword(selectedSchoolId.value, principal.id)
    revealedPassword.value = tempPassword
    revealedFor.value = principal.name
    showPasswordModal.value = true
  } catch (err) {
    errorMessage.value = err.message
  }
}

function onPageChange(newPage) {
  page.value = newPage
  loadPrincipals()
}

onMounted(async () => {
  await loadSchools()
  await loadPrincipals()
})
</script>

<template>
  <div>
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div>
        <p class="text-xs font-bold uppercase tracking-[.16em] text-spark-600 mb-1">School accounts</p>
        <h1 class="app-panel-title text-2xl">Principals</h1>
        <p class="text-ink-600 text-sm mt-1">Manage principal accounts per school.</p>
      </div>
      <button
        @click="openAddModal"
        :disabled="!selectedSchoolId"
        class="self-start sm:self-auto inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold text-white bg-gradient-to-r from-navy-800 to-navy-600 hover:from-navy-900 hover:to-navy-700 transition text-sm disabled:opacity-50"
      >
        + Add Principal
      </button>
    </div>

    <!-- School selector -->
    <div class="mb-5">
      <label class="block text-sm font-medium text-slate-700 mb-1">Select School</label>
      <select
        v-model="selectedSchoolId"
        class="w-full sm:w-72 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm"
      >
        <option v-for="school in schools" :key="school.id" :value="school.id">
          {{ school.name }}
        </option>
      </select>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
      {{ errorMessage }}
    </p>

    <div class="app-surface rounded-[22px] overflow-hidden">
      <div class="overflow-x-auto">
        <table class="app-data-table w-full min-w-[560px] text-sm">
          <thead class="bg-slate-50 text-left text-slate-500">
            <tr>
              <th class="px-5 py-3 font-medium">Name</th>
              <th class="px-5 py-3 font-medium">Email</th>
              <th class="px-5 py-3 font-medium">Status</th>
              <th class="px-5 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="isLoading">
              <td colspan="4" class="px-5 py-6 text-center text-slate-400">Loading…</td>
            </tr>
            <tr v-else-if="principals.length === 0">
              <td colspan="4" class="px-5 py-6 text-center text-slate-400">No principals for this school yet.</td>
            </tr>
            <tr v-for="principal in principals" :key="principal.id" class="hover:bg-slate-50">
              <td class="px-5 py-3 font-medium text-slate-800">{{ principal.name }}</td>
              <td class="px-5 py-3 text-slate-500">{{ principal.email }}</td>
              <td class="px-5 py-3"><StatusBadge :status="principal.status" /></td>
              <td class="px-5 py-3 text-right">
                <div class="flex items-center justify-end gap-3 whitespace-nowrap">
                  <button @click="resetPassword(principal)" class="text-navy-600 hover:text-navy-800 font-medium">Reset Password</button>
                  <button v-if="principal.status === 'ACTIVE'" @click="deactivatePrincipal(principal)" class="text-red-500 hover:text-red-700 font-medium">Deactivate</button>
                  <button v-else @click="activatePrincipal(principal)" class="text-green-600 hover:text-green-800 font-medium">Activate</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Pagination :page="page" :total-pages="totalPages" @change="onPageChange" />

    <Modal :show="showAddModal" title="Add Principal" @close="showAddModal = false">
      <form @submit.prevent="savePrincipal" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input v-model="addForm.name" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input v-model="addForm.email" type="email" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
        </div>
        <Transition name="field-message">
          <p v-if="addError" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ addError }}</p>
        </Transition>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" @click="showAddModal = false" class="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100">Cancel</button>
          <button type="submit" :disabled="isSaving" class="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-navy-800 to-navy-600 hover:from-navy-900 hover:to-navy-700 disabled:opacity-60">
            <span v-if="isSaving" class="btn-spinner" aria-hidden="true"></span>
            {{ isSaving ? 'Creating…' : 'Create' }}
          </button>
        </div>
      </form>
    </Modal>

    <Modal :show="showPasswordModal" title="Temporary Password" @close="showPasswordModal = false">
      <p class="text-sm text-slate-600 mb-3">
        Share this with <span class="font-medium text-slate-800">{{ revealedFor }}</span> now — it won't be shown again.
      </p>
      <div class="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 font-mono text-lg text-center text-navy-800 tracking-wide select-all">
        {{ revealedPassword }}
      </div>
      <button @click="showPasswordModal = false" class="w-full mt-4 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-navy-800 to-navy-600 hover:from-navy-900 hover:to-navy-700">
        Done
      </button>
    </Modal>
  </div>
</template>

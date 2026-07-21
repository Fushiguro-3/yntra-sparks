<script setup>
import { ref, onMounted, watch } from 'vue'
import { principalService } from '@/api/principalService'
import { schoolService } from '@/api/schoolService'
import Modal from '@/components/Modal.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import Pagination from '@/components/Pagination.vue'
import PageHeader from '@/components/PageHeader.vue'
import AppButton from '@/components/AppButton.vue'

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
    <PageHeader eyebrow="School accounts" title="Principals" subtitle="Manage principal accounts per school.">
      <AppButton @click="openAddModal" :disabled="!selectedSchoolId">+ Add Principal</AppButton>
    </PageHeader>

    <!-- School selector -->
    <div class="mb-5">
      <label for="principal-school-select" class="block text-sm font-medium text-slate-700 mb-1">Select School</label>
      <select
        id="principal-school-select"
        v-model="selectedSchoolId"
        class="w-full sm:w-72 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm"
      >
        <option v-for="school in schools" :key="school.id" :value="school.id">
          {{ school.name }}
        </option>
      </select>
    </div>

    <p v-if="errorMessage" role="alert" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
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
          <label for="principal-name" class="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input id="principal-name" v-model="addForm.name" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
        </div>
        <div>
          <label for="principal-email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input id="principal-email" v-model="addForm.email" type="email" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
        </div>
        <Transition name="field-message">
          <p v-if="addError" role="alert" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ addError }}</p>
        </Transition>
        <div class="flex justify-end gap-2 pt-2">
          <AppButton type="button" variant="quiet" @click="showAddModal = false">Cancel</AppButton>
          <AppButton type="submit" :loading="isSaving">{{ isSaving ? 'Creating…' : 'Create' }}</AppButton>
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
      <AppButton @click="showPasswordModal = false" block class="mt-4">Done</AppButton>
    </Modal>
  </div>
</template>

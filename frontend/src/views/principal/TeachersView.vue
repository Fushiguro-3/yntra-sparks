<script setup>
import { ref, onMounted } from 'vue'
import { teacherService } from '@/api/teacherService'
import { useAuthStore } from '@/stores/auth'
import Modal from '@/components/Modal.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import Pagination from '@/components/Pagination.vue'
import PageHeader from '@/components/PageHeader.vue'
import AppButton from '@/components/AppButton.vue'

const auth = useAuthStore()
const schoolId = auth.user?.schoolId

const teachers = ref([])
const page = ref(0)
const totalPages = ref(0)
const isLoading = ref(true)
const errorMessage = ref('')

// Add-teacher modal
const showAddModal = ref(false)
const addForm = ref({ name: '', email: '' })
const addError = ref('')
const isSaving = ref(false)

// One-time temp password reveal (shown after create or reset)
const showPasswordModal = ref(false)
const revealedPassword = ref('')
const revealedFor = ref('')

async function loadTeachers() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await teacherService.list(schoolId, { page: page.value })
    teachers.value = res.content
    totalPages.value = res.totalPages
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isLoading.value = false
  }
}

function openAddModal() {
  addForm.value = { name: '', email: '' }
  addError.value = ''
  showAddModal.value = true
}

async function saveTeacher() {
  if (!addForm.value.name.trim() || !addForm.value.email.trim()) {
    addError.value = 'Name and email are required.'
    return
  }
  isSaving.value = true
  addError.value = ''
  try {
    const { tempPassword } = await teacherService.create(schoolId, addForm.value)
    showAddModal.value = false
    revealedPassword.value = tempPassword
    revealedFor.value = addForm.value.name
    showPasswordModal.value = true
    await loadTeachers()
  } catch (err) {
    addError.value = err.message
  } finally {
    isSaving.value = false
  }
}

async function deactivateTeacher(teacher) {
  if (!confirm(`Deactivate ${teacher.name}? They'll lose access immediately.`)) return
  errorMessage.value = ''
  try {
    await teacherService.deactivate(schoolId, teacher.id)
    await loadTeachers()
  } catch (err) {
    errorMessage.value = err.message
  }
}

async function activateTeacher(teacher) {
  if (!confirm(`Activate ${teacher.name}? They'll be able to sign in again.`)) return
  errorMessage.value = ''
  try {
    await teacherService.activate(schoolId, teacher.id)
    await loadTeachers()
  } catch (err) {
    errorMessage.value = err.message
  }
}

async function resetPassword(teacher) {
  if (!confirm(`Reset password for ${teacher.name}? Their old password will stop working immediately.`)) return
  errorMessage.value = ''
  try {
    const { tempPassword } = await teacherService.resetPassword(schoolId, teacher.id)
    revealedPassword.value = tempPassword
    revealedFor.value = teacher.name
    showPasswordModal.value = true
  } catch (err) {
    errorMessage.value = err.message
  }
}

function onPageChange(newPage) {
  page.value = newPage
  loadTeachers()
}

onMounted(loadTeachers)
</script>

<template>
  <div>
    <PageHeader title="Teachers" subtitle="Manage teacher accounts for your school.">
      <AppButton @click="openAddModal">+ Add Teacher</AppButton>
    </PageHeader>

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
            <th class="px-5 py-3 font-medium text-right w-[240px]">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="isLoading">
            <td colspan="4" class="px-5 py-6 text-center text-slate-400">Loading…</td>
          </tr>
          <tr v-else-if="teachers.length === 0">
            <td colspan="4" class="px-5 py-6 text-center text-slate-400">No teachers yet.</td>
          </tr>
          <tr v-for="teacher in teachers" :key="teacher.id" class="hover:bg-slate-50">
            <td class="px-5 py-3 font-medium text-slate-800">{{ teacher.name }}</td>
            <td class="px-5 py-3 text-slate-500">{{ teacher.email }}</td>
            <td class="px-5 py-3"><StatusBadge :status="teacher.status" /></td>
            <td class="px-5 py-3">
              <div class="flex items-center justify-end gap-3 whitespace-nowrap">
              <button @click="resetPassword(teacher)" class="text-navy-600 hover:text-navy-800 font-medium">Reset Password</button>
              <button v-if="teacher.status === 'ACTIVE'" @click="deactivateTeacher(teacher)" class="text-red-500 hover:text-red-700 font-medium">Deactivate</button>
              <button v-else @click="activateTeacher(teacher)" class="text-green-600 hover:text-green-800 font-medium">Activate</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <Pagination :page="page" :total-pages="totalPages" @change="onPageChange" />

    <Modal :show="showAddModal" title="Add Teacher" @close="showAddModal = false">
      <form @submit.prevent="saveTeacher" class="space-y-4">
        <div>
          <label for="teacher-name" class="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input id="teacher-name" v-model="addForm.name" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
        </div>
        <div>
          <label for="teacher-email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input id="teacher-email" v-model="addForm.email" type="email" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
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
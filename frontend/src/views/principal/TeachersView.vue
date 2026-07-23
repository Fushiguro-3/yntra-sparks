<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { teacherService } from '@/api/teacherService'
import { useAuthStore } from '@/stores/auth'
import { teacherInvitationStore } from '@/services/teacherInvitationStore'
import Modal from '@/components/Modal.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import Pagination from '@/components/Pagination.vue'
import PageHeader from '@/components/PageHeader.vue'
import AppButton from '@/components/AppButton.vue'
import { useClientTable } from '@/composables/useClientTable'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import { useNotifications } from '@/composables/useNotifications'

const auth = useAuthStore()
const schoolId = auth.user?.schoolId
const toast = useToast()
const { confirm } = useConfirm()
const { notify } = useNotifications()

// Allows a deep link like { name: 'principal-teachers', query: { tab: 'invitations' } }
// (used by the Dashboard's "Pending invitations" card) to land on that tab.
const route = useRoute()
const activeTab = ref(route.query.tab === 'invitations' ? 'invitations' : 'teachers')

const teachers = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

const { search, page, filtered, paged } = useClientTable(
  teachers,
  (t, q) => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)
)

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
    const res = await teacherService.list(schoolId, { size: 200 })
    teachers.value = res.content
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
    toast.success('Teacher added.')
    notify(auth.user?.id, {
      type: 'teacher-created',
      title: 'Teacher added',
      message: `${addForm.value.name} was added to your school.`,
      to: { name: 'principal-teachers' }
    })
    await loadTeachers()
  } catch (err) {
    addError.value = err.message
  } finally {
    isSaving.value = false
  }
}

async function deactivateTeacher(teacher) {
  const confirmed = await confirm({
    title: 'Deactivate teacher?',
    message: `Deactivate ${teacher.name}? They'll lose access immediately.`,
    confirmLabel: 'Deactivate',
    danger: true
  })
  if (!confirmed) return
  errorMessage.value = ''
  try {
    await teacherService.deactivate(schoolId, teacher.id)
    toast.success(`${teacher.name} deactivated.`)
    notify(auth.user?.id, {
      type: 'teacher-deactivated',
      title: 'Teacher deactivated',
      message: `${teacher.name} lost access to your school's kits.`,
      to: { name: 'principal-teachers' }
    })
    await loadTeachers()
  } catch (err) {
    errorMessage.value = err.message
    toast.error(err.message)
  }
}

async function activateTeacher(teacher) {
  const confirmed = await confirm({
    title: 'Activate teacher?',
    message: `Activate ${teacher.name}? They'll be able to sign in again.`,
    confirmLabel: 'Activate'
  })
  if (!confirmed) return
  errorMessage.value = ''
  try {
    await teacherService.activate(schoolId, teacher.id)
    toast.success(`${teacher.name} activated.`)
    await loadTeachers()
  } catch (err) {
    errorMessage.value = err.message
    toast.error(err.message)
  }
}

async function resetPassword(teacher) {
  const confirmed = await confirm({
    title: 'Reset password?',
    message: `Reset password for ${teacher.name}? Their old password will stop working immediately.`,
    confirmLabel: 'Reset password',
    danger: true
  })
  if (!confirmed) return
  errorMessage.value = ''
  try {
    const { tempPassword } = await teacherService.resetPassword(schoolId, teacher.id)
    revealedPassword.value = tempPassword
    revealedFor.value = teacher.name
    showPasswordModal.value = true
  } catch (err) {
    errorMessage.value = err.message
    toast.error(err.message)
  }
}

// ---------------- Teacher invitations ----------------
const invitations = ref([])
const pendingInvitationCount = computed(() => invitations.value.filter((i) => i.status === 'pending').length)

const showInviteModal = ref(false)
const inviteForm = ref({ name: '', email: '', phone: '', gradeOrSubject: '' })
const inviteError = ref('')
const isInviting = ref(false)
const revokingId = ref(null)

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  accepted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  expired: 'bg-slate-100 text-slate-500 border-slate-200',
  revoked: 'bg-red-50 text-red-600 border-red-200'
}

function loadInvitations() {
  invitations.value = teacherInvitationStore.listBySchool(schoolId)
}

function openInviteModal() {
  inviteForm.value = { name: '', email: '', phone: '', gradeOrSubject: '' }
  inviteError.value = ''
  showInviteModal.value = true
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function sendInvite() {
  const name = inviteForm.value.name.trim()
  const email = inviteForm.value.email.trim().toLowerCase()

  if (!name || !email) {
    inviteError.value = 'Name and email are required.'
    return
  }
  if (!EMAIL_PATTERN.test(email)) {
    inviteError.value = 'Please enter a valid email address.'
    return
  }
  if (teacherInvitationStore.hasPendingInvite(schoolId, email)) {
    inviteError.value = 'There is already a pending invitation for this email.'
    return
  }
  if (teachers.value.some((t) => t.email.toLowerCase() === email && t.status === 'ACTIVE')) {
    inviteError.value = 'This email already belongs to an active teacher at your school.'
    return
  }

  isInviting.value = true
  inviteError.value = ''
  try {
    teacherInvitationStore.create(schoolId, { ...inviteForm.value, name, email })
    showInviteModal.value = false
    loadInvitations()
    toast.success(`Invitation sent to ${name}.`)
  } finally {
    isInviting.value = false
  }
}

async function resendInvite(invite) {
  teacherInvitationStore.resend(invite.id)
  loadInvitations()
  toast.success(`Invitation resent to ${invite.name}.`)
}

async function revokeInvite(invite) {
  const confirmed = await confirm({
    title: 'Revoke invitation?',
    message: `Revoke the invitation for ${invite.name}? The invitation link will stop working.`,
    confirmLabel: 'Revoke',
    danger: true
  })
  if (!confirmed) return
  revokingId.value = invite.id
  try {
    teacherInvitationStore.revoke(invite.id)
    loadInvitations()
    toast.success('Invitation revoked.')
  } finally {
    revokingId.value = null
  }
}

async function copyInviteLink(invite) {
  const link = `${window.location.origin}/login?invite=${invite.token}`
  try {
    await navigator.clipboard.writeText(link)
    toast.success('Invitation link copied to clipboard.')
  } catch {
    toast.error('Could not copy the link — your browser may have blocked clipboard access.')
  }
}

/**
 * There's no second person to click a real invitation link in mock mode —
 * this simulates that click for testing/demo purposes only. It converts the
 * invitation into a real mock teacher account via the exact same
 * teacherService.create() the "+ Add Teacher" button uses, so there is
 * still only one code path that ever creates a teacher.
 */
async function simulateAcceptInvite(invite) {
  try {
    const { tempPassword } = await teacherService.create(schoolId, { name: invite.name, email: invite.email })
    teacherInvitationStore.markAccepted(invite.id)
    loadInvitations()
    await loadTeachers()
    revealedPassword.value = tempPassword
    revealedFor.value = invite.name
    showPasswordModal.value = true
    toast.success(`${invite.name}'s invitation was accepted — account created.`)
    notify(auth.user?.id, {
      type: 'invitation-accepted',
      title: 'Invitation accepted',
      message: `${invite.name} accepted their invitation and is now an active teacher.`,
      to: { name: 'principal-teachers' }
    })
  } catch (err) {
    toast.error(err.message || 'Could not create the teacher account.')
  }
}

onMounted(() => {
  loadTeachers()
  loadInvitations()
})
</script>

<template>
  <div>
    <PageHeader title="Teachers" subtitle="Manage teacher accounts for your school.">
      <AppButton v-if="activeTab === 'teachers'" @click="openAddModal">+ Add Teacher</AppButton>
      <AppButton v-else @click="openInviteModal">+ Invite Teacher</AppButton>
    </PageHeader>

    <div class="flex flex-wrap gap-2 mb-4" role="tablist" aria-label="Teacher management views">
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'teachers'"
        class="px-3.5 py-1.5 rounded-full text-sm font-semibold transition"
        :class="activeTab === 'teachers' ? 'bg-navy-800 text-white' : 'bg-white border border-navy-100 text-ink-600 hover:border-navy-300'"
        @click="activeTab = 'teachers'"
      >
        Teachers
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'invitations'"
        class="px-3.5 py-1.5 rounded-full text-sm font-semibold transition"
        :class="activeTab === 'invitations' ? 'bg-navy-800 text-white' : 'bg-white border border-navy-100 text-ink-600 hover:border-navy-300'"
        @click="activeTab = 'invitations'"
      >
        Invitations
        <span v-if="pendingInvitationCount > 0" class="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-spark-500 text-white text-xs">{{ pendingInvitationCount }}</span>
      </button>
    </div>

    <p v-if="errorMessage" role="alert" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
      {{ errorMessage }}
    </p>

    <template v-if="activeTab === 'teachers'">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <input
          v-model="search"
          type="search"
          class="app-input sm:max-w-xs"
          placeholder="Search by name or email"
          aria-label="Search teachers"
        >
        <p class="text-xs text-ink-600 shrink-0">{{ filtered.length }} teacher{{ filtered.length === 1 ? '' : 's' }}</p>
      </div>

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
            <tr v-else-if="paged.content.length === 0">
              <td colspan="4" class="px-5 py-6 text-center text-slate-400">{{ search ? 'No teachers match your search.' : 'No teachers yet.' }}</td>
            </tr>
            <tr v-for="teacher in paged.content" :key="teacher.id" class="hover:bg-slate-50">
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

      <Pagination :page="page" :total-pages="paged.totalPages" @change="page = $event" />
    </template>

    <template v-else>
      <div class="app-surface rounded-[22px] overflow-hidden">
        <div class="overflow-x-auto">
        <table class="app-data-table w-full min-w-[720px] text-sm">
          <thead class="bg-slate-50 text-left text-slate-500">
            <tr>
              <th class="px-5 py-3 font-medium">Name</th>
              <th class="px-5 py-3 font-medium">Email</th>
              <th class="px-5 py-3 font-medium">Status</th>
              <th class="px-5 py-3 font-medium">Expires</th>
              <th class="px-5 py-3 font-medium text-right w-[320px]">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-if="invitations.length === 0">
              <td colspan="5" class="px-5 py-6 text-center text-slate-400">No invitations sent yet.</td>
            </tr>
            <tr v-for="invite in invitations" :key="invite.id" class="hover:bg-slate-50">
              <td class="px-5 py-3 font-medium text-slate-800">{{ invite.name }}</td>
              <td class="px-5 py-3 text-slate-500">{{ invite.email }}</td>
              <td class="px-5 py-3">
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize" :class="STATUS_STYLES[invite.status]">
                  {{ invite.status }}
                </span>
              </td>
              <td class="px-5 py-3 text-slate-500 whitespace-nowrap">{{ new Date(invite.expiresAt).toLocaleDateString('en-IN') }}</td>
              <td class="px-5 py-3">
                <div class="flex items-center justify-end gap-3 whitespace-nowrap flex-wrap">
                  <template v-if="invite.status === 'pending'">
                    <button @click="copyInviteLink(invite)" class="text-navy-600 hover:text-navy-800 font-medium">Copy link</button>
                    <button @click="resendInvite(invite)" class="text-navy-600 hover:text-navy-800 font-medium">Resend</button>
                    <button @click="simulateAcceptInvite(invite)" class="text-emerald-600 hover:text-emerald-700 font-medium" title="Testing/demo only — simulates the invited teacher accepting">Simulate acceptance (mock)</button>
                    <button :disabled="revokingId === invite.id" @click="revokeInvite(invite)" class="text-red-500 hover:text-red-700 font-medium disabled:opacity-50">Revoke</button>
                  </template>
                  <template v-else-if="invite.status === 'expired'">
                    <button @click="resendInvite(invite)" class="text-navy-600 hover:text-navy-800 font-medium">Resend</button>
                  </template>
                  <span v-else class="text-xs text-slate-400">No actions available</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </template>

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

    <Modal :show="showInviteModal" title="Invite Teacher" @close="showInviteModal = false">
      <form @submit.prevent="sendInvite" class="space-y-4">
        <p class="text-xs text-ink-600 bg-navy-50 border border-navy-100 rounded-lg px-3 py-2">
          Mock mode: no real email is sent. Use "Copy link" on the Invitations tab to share the invitation, or "Simulate acceptance" to test the flow end-to-end.
        </p>
        <div>
          <label for="invite-name" class="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input id="invite-name" v-model="inviteForm.name" type="text" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
        </div>
        <div>
          <label for="invite-email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input id="invite-email" v-model="inviteForm.email" type="email" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
        </div>
        <div>
          <label for="invite-phone" class="block text-sm font-medium text-slate-700 mb-1">Phone <span class="text-slate-400 font-normal">(optional)</span></label>
          <input id="invite-phone" v-model="inviteForm.phone" type="tel" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
        </div>
        <div>
          <label for="invite-grade" class="block text-sm font-medium text-slate-700 mb-1">Grade / Subject <span class="text-slate-400 font-normal">(optional)</span></label>
          <input id="invite-grade" v-model="inviteForm.gradeOrSubject" type="text" placeholder="e.g. Grade 6 Science" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy-500">
        </div>
        <Transition name="field-message">
          <p v-if="inviteError" role="alert" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{{ inviteError }}</p>
        </Transition>
        <div class="flex justify-end gap-2 pt-2">
          <AppButton type="button" variant="quiet" @click="showInviteModal = false">Cancel</AppButton>
          <AppButton type="submit" :loading="isInviting">{{ isInviting ? 'Sending…' : 'Send Invitation' }}</AppButton>
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

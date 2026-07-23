<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useAuthStore, ROLES } from '@/stores/auth'
import { schoolService } from '@/api/schoolService'
import { teacherService } from '@/api/teacherService'
import { kitService } from '@/api/kitService'
import { useProfileOverlay } from '@/composables/useProfileOverlay'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'
import PageHeader from '@/components/PageHeader.vue'
import AvatarUploader from '@/components/portal/AvatarUploader.vue'

// Shared profile page for all three portals — the route guard for each of
// admin-profile/principal-profile/teacher-profile already restricts this to
// its own role (see router/index.js), and since it only ever reads the
// CURRENTLY authenticated auth.user (no :id route param exists), there is
// no way to reach another user's profile by URL manipulation.
const auth = useAuthStore()
const toast = useToast()
const { confirm } = useConfirm()
const { overlayState, update: updateOverlay } = useProfileOverlay()

const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.PRINCIPAL]: 'Principal',
  [ROLES.TEACHER]: 'Teacher'
}

const overlay = computed(() => overlayState.overlay)
const form = reactive({
  name: '',
  phone: '',
  avatarUrl: ''
})
const fieldErrors = reactive({ name: '' })
const isEditing = ref(false)
const isSaving = ref(false)

const displayName = computed(() => overlay.value.displayName || auth.user?.name || '')
const initials = computed(() => {
  const source = (displayName.value || auth.user?.email || '').trim()
  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
})

// Snapshot taken at edit-start, compared against the live form to detect
// unsaved changes — used both for the Cancel-restore and the
// leave-mid-edit warning below.
let editSnapshot = null
const isDirty = computed(() => {
  if (!editSnapshot) return false
  return form.name !== editSnapshot.name || form.phone !== editSnapshot.phone || form.avatarUrl !== editSnapshot.avatarUrl
})

function startEdit() {
  form.name = displayName.value
  form.phone = overlay.value.phone || ''
  form.avatarUrl = overlay.value.avatarUrl || ''
  editSnapshot = { ...form }
  fieldErrors.name = ''
  isEditing.value = true
}
function cancelEdit() {
  if (editSnapshot) Object.assign(form, editSnapshot)
  editSnapshot = null
  isEditing.value = false
}
async function saveEdit() {
  fieldErrors.name = form.name.trim() ? '' : 'Name is required.'
  if (fieldErrors.name) return
  if (isSaving.value) return

  isSaving.value = true
  try {
    // Frontend-only persistence (localStorage) — see profileStore.js via
    // useProfileOverlay, which also keeps UserMenu/PortalShell's header
    // display in sync immediately. Nothing here touches role/schoolId/
    // email, which stay backend-owned.
    updateOverlay(auth.user.id, {
      displayName: form.name.trim(),
      phone: form.phone.trim(),
      avatarUrl: form.avatarUrl.trim()
    })
    editSnapshot = null
    isEditing.value = false
    toast.success('Profile updated.')
  } finally {
    isSaving.value = false
  }
}

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

function handleAvatarChange(dataUrl) {
  form.avatarUrl = dataUrl
}
function handleAvatarRemove() {
  form.avatarUrl = ''
}

// Warn instead of silently discarding an in-progress edit if the user
// navigates away (sidebar/topbar/back button) without saving.
onBeforeRouteLeave(async () => {
  if (!isEditing.value || !isDirty.value) return true
  const shouldLeave = await confirm({
    title: 'Discard unsaved changes?',
    message: 'You have unsaved profile changes. Leave this page without saving?',
    confirmLabel: 'Discard changes',
    cancelLabel: 'Keep editing',
    danger: true
  })
  return shouldLeave
})

// Role-specific data
const schoolName = ref('')
const teacherCount = ref(null)
const kitCount = ref(null)
const isLoadingRoleData = ref(false)

async function loadRoleData() {
  if (!auth.user?.schoolId) return
  isLoadingRoleData.value = true
  try {
    const school = await schoolService.getById(auth.user.schoolId)
    schoolName.value = school?.name || ''

    if (auth.role === ROLES.PRINCIPAL) {
      const [teachers, kits] = await Promise.all([
        teacherService.list(auth.user.schoolId, { size: 200 }),
        kitService.listForMySchool({ size: 200 })
      ])
      teacherCount.value = teachers.totalElements ?? teachers.content?.length ?? 0
      kitCount.value = kits.totalElements ?? kits.content?.length ?? 0
    } else if (auth.role === ROLES.TEACHER) {
      const kits = await kitService.listForMySchool({ size: 200 })
      kitCount.value = kits.totalElements ?? kits.content?.length ?? 0
    }
  } catch {
    // Best-effort supplementary info — the core profile above still renders.
  } finally {
    isLoadingRoleData.value = false
  }
}

onMounted(loadRoleData)
</script>

<template>
  <div>
    <PageHeader eyebrow="Account" title="Profile" subtitle="Your account details and preferences." />

    <div class="grid grid-cols-1 lg:grid-cols-[1fr,1.4fr] gap-6 items-start">
      <div class="app-surface rounded-[24px] p-6 text-center">
        <div class="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden bg-gradient-to-br from-navy-700 to-navy-900 text-white flex items-center justify-center text-2xl font-bold">
          <img v-if="overlay.avatarUrl" :src="overlay.avatarUrl" :alt="displayName" class="w-full h-full object-cover">
          <span v-else aria-hidden="true">{{ initials }}</span>
        </div>
        <p class="font-display font-semibold text-navy-900">{{ displayName }}</p>
        <p class="text-sm text-ink-600">{{ auth.user?.email }}</p>
        <p class="mt-3">
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
        </p>
        <dl class="mt-5 space-y-2 text-left text-sm">
          <div class="flex justify-between gap-3">
            <dt class="text-ink-600">Role</dt>
            <dd class="font-semibold text-navy-900">{{ ROLE_LABELS[auth.role] }}</dd>
          </div>
          <div v-if="overlay.phone" class="flex justify-between gap-3">
            <dt class="text-ink-600">Phone</dt>
            <dd class="font-semibold text-navy-900 break-words">{{ overlay.phone }}</dd>
          </div>
          <div v-if="schoolName" class="flex justify-between gap-3">
            <dt class="text-ink-600">School</dt>
            <dd class="font-semibold text-navy-900 text-right break-words">{{ schoolName }}</dd>
          </div>
          <div v-if="overlay.updatedAt" class="flex justify-between gap-3">
            <dt class="text-ink-600">Last updated</dt>
            <dd class="font-semibold text-navy-900 text-right">{{ formatDate(overlay.updatedAt) }}</dd>
          </div>
        </dl>
      </div>

      <div class="space-y-6">
        <div class="app-surface rounded-[24px] p-6">
          <div class="flex items-center justify-between mb-4">
            <p class="app-panel-title">Edit profile</p>
            <button v-if="!isEditing" type="button" class="app-button-outline" @click="startEdit">Edit</button>
          </div>

          <form v-if="isEditing" class="space-y-4" @submit.prevent="saveEdit">
            <div>
              <label for="profile-name" class="block text-xs font-semibold uppercase tracking-wide text-ink-900 mb-1.5">Name</label>
              <input id="profile-name" v-model="form.name" type="text" class="app-input" :aria-invalid="!!fieldErrors.name">
              <p v-if="fieldErrors.name" class="mt-1 text-xs text-red-600">{{ fieldErrors.name }}</p>
            </div>
            <div>
              <label for="profile-phone" class="block text-xs font-semibold uppercase tracking-wide text-ink-900 mb-1.5">Phone</label>
              <input id="profile-phone" v-model="form.phone" type="tel" class="app-input" placeholder="Optional">
            </div>
            <div>
              <p class="block text-xs font-semibold uppercase tracking-wide text-ink-900 mb-1.5">Avatar</p>
              <AvatarUploader
                :avatar-url="form.avatarUrl"
                :display-name="form.name"
                @change="handleAvatarChange"
                @remove="handleAvatarRemove"
              />
            </div>
            <p class="text-xs text-ink-600">Email, role, and school assignment are managed by Yntra Sparks and can't be changed here.</p>
            <div class="flex gap-3">
              <button type="submit" class="app-button-primary" :disabled="isSaving">{{ isSaving ? 'Saving...' : 'Save changes' }}</button>
              <button type="button" class="app-button-outline" @click="cancelEdit">Cancel</button>
            </div>
          </form>
          <dl v-else class="space-y-2 text-sm">
            <div class="flex justify-between gap-3">
              <dt class="text-ink-600">Name</dt>
              <dd class="font-semibold text-navy-900">{{ displayName }}</dd>
            </div>
            <div class="flex justify-between gap-3">
              <dt class="text-ink-600">Email</dt>
              <dd class="font-semibold text-navy-900 break-words">{{ auth.user?.email }}</dd>
            </div>
          </dl>
        </div>

        <div class="app-surface rounded-[24px] p-6">
          <p class="app-panel-title mb-3">Security</p>
          <p class="text-sm text-ink-600 mb-4">Change your password any time — you don't need to wait for a forced reset.</p>
          <RouterLink :to="{ name: 'change-password' }" class="app-button-outline inline-flex">Change Password</RouterLink>
        </div>

        <div v-if="auth.role === ROLES.PRINCIPAL" class="app-surface rounded-[24px] p-6">
          <p class="app-panel-title mb-3">School overview</p>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-ink-600">Teachers</p>
              <p class="font-display font-bold text-2xl text-navy-900">{{ teacherCount ?? '—' }}</p>
            </div>
            <div>
              <p class="text-ink-600">Assigned kits</p>
              <p class="font-display font-bold text-2xl text-navy-900">{{ kitCount ?? '—' }}</p>
            </div>
          </div>
        </div>

        <div v-else-if="auth.role === ROLES.TEACHER" class="app-surface rounded-[24px] p-6">
          <p class="app-panel-title mb-3">Access</p>
          <p class="text-sm text-ink-600">You have access to <strong class="text-navy-900">{{ kitCount ?? '—' }}</strong> kit{{ kitCount === 1 ? '' : 's' }} at {{ schoolName || 'your school' }}.</p>
        </div>

        <div v-else-if="auth.role === ROLES.SUPER_ADMIN" class="app-surface rounded-[24px] p-6">
          <p class="app-panel-title mb-3">Administrative access</p>
          <p class="text-sm text-ink-600">Full access to Schools, Principals, Categories, Kits, and Messages across every school on the platform.</p>
        </div>
      </div>
    </div>
  </div>
</template>

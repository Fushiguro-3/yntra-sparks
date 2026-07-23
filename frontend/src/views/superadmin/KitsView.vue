<script setup>
import { ref, onMounted } from 'vue'
import { kitService } from '@/api/kitService'
import { schoolService } from '@/api/schoolService'
import Modal from '@/components/Modal.vue'
import StatusBadge from '@/components/StatusBadge.vue'
import Pagination from '@/components/Pagination.vue'
import PageHeader from '@/components/PageHeader.vue'
import AppButton from '@/components/AppButton.vue'
import { useClientTable } from '@/composables/useClientTable'
import { useToast } from '@/composables/useToast'
import { useConfirm } from '@/composables/useConfirm'

const toast = useToast()
const { confirm } = useConfirm()

const kits = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

const { search, page, filtered, paged } = useClientTable(
  kits,
  (kit, q) =>
    kit.title.toLowerCase().includes(q) ||
    (kit.categoryName || '').toLowerCase().includes(q) ||
    (kit.grade || '').toLowerCase().includes(q)
)

const showAccessModal = ref(false)
const activeKit = ref(null)
const allSchools = ref([])
const assignedSchoolIds = ref(new Set())
const accessError = ref('')
const isTogglingSchoolId = ref(null)

async function loadKits() {
  isLoading.value = true
  errorMessage.value = ''
  try {
    const res = await kitService.list({ size: 200 })
    kits.value = res.content
  } catch (err) {
    errorMessage.value = err.message
  } finally {
    isLoading.value = false
  }
}

function formatPrice(price) {
  if (price === null || price === undefined || price === '') return '-'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(price))
}

async function archiveKit(kit) {
  const confirmed = await confirm({
    title: 'Delete kit?',
    message: `Delete "${kit.title}" from the active catalog? It will be hidden from the public site and schools.`,
    confirmLabel: 'Delete',
    danger: true
  })
  if (!confirmed) return
  errorMessage.value = ''
  try {
    await kitService.archive(kit.id)
    toast.success(`"${kit.title}" removed from the active catalog.`)
    await loadKits()
  } catch (err) {
    errorMessage.value = err.message
    toast.error(err.message)
  }
}

async function openAccessModal(kit) {
  activeKit.value = kit
  accessError.value = ''
  assignedSchoolIds.value = new Set()
  showAccessModal.value = true
  try {
    const [schoolsRes, assignedSchools] = await Promise.all([
      schoolService.list({ size: 100, sort: 'name,asc' }),
      kitService.listSchoolsForKit(kit.id)
    ])
    allSchools.value = schoolsRes.content.filter((school) => school.status === 'ACTIVE')
    assignedSchoolIds.value = new Set(assignedSchools.map((school) => school.id))
  } catch (err) {
    accessError.value = err.message
  }
}

async function toggleSchoolAccess(school) {
  if (!activeKit.value) return
  isTogglingSchoolId.value = school.id
  accessError.value = ''
  const isAssigned = assignedSchoolIds.value.has(school.id)
  try {
    if (isAssigned) {
      await kitService.revokeFromSchool(school.id, activeKit.value.id)
      assignedSchoolIds.value.delete(school.id)
    } else {
      await kitService.assignToSchool(school.id, activeKit.value.id)
      assignedSchoolIds.value.add(school.id)
    }
    assignedSchoolIds.value = new Set(assignedSchoolIds.value)
  } catch (err) {
    accessError.value = err.message
  } finally {
    isTogglingSchoolId.value = null
  }
}

onMounted(loadKits)
</script>

<template>
  <div>
    <PageHeader eyebrow="Product library" title="Kits" subtitle="Manage the STEM kit catalog.">
      <AppButton as="router-link" :to="{ name: 'admin-kit-new' }">+ Add Kit</AppButton>
    </PageHeader>

    <p v-if="errorMessage" role="alert" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
      {{ errorMessage }}
    </p>

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <input
        v-model="search"
        type="search"
        class="app-input sm:max-w-xs"
        placeholder="Search by title, category, or grade"
        aria-label="Search kits"
      >
      <p class="text-xs text-ink-600 shrink-0">{{ filtered.length }} kit{{ filtered.length === 1 ? '' : 's' }}</p>
    </div>

    <div class="app-surface rounded-[22px] overflow-hidden">
      <div class="overflow-x-auto">
      <table class="app-data-table w-full min-w-[850px] text-sm">
        <thead class="bg-slate-50 text-left text-slate-500">
          <tr>
            <th class="px-5 py-3 font-medium">Title</th>
            <th class="px-5 py-3 font-medium">Grade</th>
            <th class="px-5 py-3 font-medium">Price</th>
            <th class="px-5 py-3 font-medium">Category</th>
            <th class="px-5 py-3 font-medium">Status</th>
            <th class="px-5 py-3 font-medium text-right w-[265px]">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="isLoading">
            <td colspan="6" class="px-5 py-6 text-center text-slate-400">Loading...</td>
          </tr>
          <tr v-else-if="paged.content.length === 0">
            <td colspan="6" class="px-5 py-6 text-center text-slate-400">{{ search ? 'No kits match your search.' : 'No kits yet.' }}</td>
          </tr>
          <tr v-for="kit in paged.content" :key="kit.id" class="hover:bg-slate-50">
            <td class="px-5 py-3 font-medium text-slate-800">{{ kit.title }}</td>
            <td class="px-5 py-3 text-slate-500">{{ kit.grade || '-' }}</td>
            <td class="px-5 py-3 text-slate-500">{{ formatPrice(kit.price) }}</td>
            <td class="px-5 py-3 text-slate-500">{{ kit.categoryName ?? kit.category?.name ?? '-' }}</td>
            <td class="px-5 py-3"><StatusBadge :status="kit.status" /></td>
            <td class="px-5 py-3">
              <div class="flex items-center justify-end gap-3 whitespace-nowrap">
              <button @click="openAccessModal(kit)" class="text-slate-500 hover:text-slate-800 font-medium">Manage Access</button>
              <RouterLink :to="{ name: 'admin-kit-edit', params: { id: kit.id } }" class="text-navy-600 hover:text-navy-800 font-medium">Edit</RouterLink>
              <button v-if="kit.status !== 'ARCHIVED'" @click="archiveKit(kit)" class="text-red-500 hover:text-red-700 font-medium">Delete</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <Pagination :page="page" :total-pages="paged.totalPages" @change="page = $event" />

    <Modal :show="showAccessModal" :title="`Manage Access - ${activeKit?.title}`" @close="showAccessModal = false" max-width="max-w-lg">
      <p class="text-xs text-slate-500 mb-4">
        Toggle which schools can see this kit.
      </p>
      <p v-if="accessError" role="alert" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">{{ accessError }}</p>
      <div class="max-h-80 overflow-y-auto divide-y divide-slate-100">
        <div v-for="school in allSchools" :key="school.id" class="flex items-center justify-between py-2.5">
          <span class="text-sm text-slate-700">{{ school.name }}</span>
          <button
            @click="toggleSchoolAccess(school)"
            :disabled="isTogglingSchoolId === school.id"
            class="text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
            :class="assignedSchoolIds.has(school.id)
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'"
          >
            {{ assignedSchoolIds.has(school.id) ? 'Granted' : 'Grant' }}
          </button>
        </div>
        <p v-if="allSchools.length === 0" class="text-sm text-slate-400 py-4 text-center">No active schools.</p>
      </div>
    </Modal>
  </div>
</template>

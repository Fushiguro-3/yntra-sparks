<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore, ROLES } from '@/stores/auth'
import { kitService } from '@/api/kitService'
import { useSavedKits } from '@/composables/useSavedKits'
import { useToast } from '@/composables/useToast'
import { useNotifications } from '@/composables/useNotifications'
import PageHeader from '@/components/PageHeader.vue'

// Shared Saved Kits page for Teacher and Principal — the only thing that
// differs per role is which kit-detail route a saved kit links back to.
const auth = useAuthStore()
const toast = useToast()
const { load: loadSavedKits, list, remove } = useSavedKits()
const { notify } = useNotifications()

loadSavedKits(auth.user?.id)

const KIT_DETAIL_ROUTE = {
  [ROLES.TEACHER]: 'teacher-kit-detail',
  [ROLES.PRINCIPAL]: 'principal-kit-detail'
}
const KIT_LIST_ROUTE = {
  [ROLES.TEACHER]: 'teacher-kits',
  [ROLES.PRINCIPAL]: 'principal-kits'
}
const SAVED_KITS_ROUTE = {
  [ROLES.TEACHER]: 'teacher-saved-kits',
  [ROLES.PRINCIPAL]: 'principal-saved-kits'
}
const kitDetailRoute = computed(() => KIT_DETAIL_ROUTE[auth.role])
const kitListRoute = computed(() => KIT_LIST_ROUTE[auth.role])

const savedKits = computed(() => list())
const unavailableIds = ref(new Set())
const isCheckingAvailability = ref(true)

async function checkAvailability() {
  isCheckingAvailability.value = true
  try {
    const res = await kitService.listForMySchool({ size: 200 })
    const accessibleIds = new Set((res.content || []).map((k) => k.id))
    const newlyUnavailable = savedKits.value.filter((k) => !accessibleIds.has(k.id))
    unavailableIds.value = new Set(newlyUnavailable.map((k) => k.id))

    // Deduped by kit id so revisiting this page never re-notifies for the
    // same kit — only the first time it's noticed missing.
    for (const kit of newlyUnavailable) {
      notify(auth.user?.id, {
        type: 'saved-kit-unavailable',
        title: 'Saved kit no longer available',
        message: `"${kit.title}" is no longer accessible to your school.`,
        to: { name: SAVED_KITS_ROUTE[auth.role] },
        dedupeKey: `saved-kit-unavailable-${kit.id}`
      })
    }
  } catch {
    // Best-effort — if this check fails, saved kits still render normally,
    // just without the "no longer available" flag.
  } finally {
    isCheckingAvailability.value = false
  }
}

function handleRemove(kit) {
  remove(auth.user?.id, kit.id)
  toast.success(`Removed "${kit.title}" from saved kits.`)
}

onMounted(checkAvailability)
</script>

<template>
  <div>
    <PageHeader eyebrow="Your library" title="Saved Kits" subtitle="Kits you've bookmarked for quick access later." />

    <div v-if="savedKits.length === 0" class="empty-state app-surface rounded-[24px]">
      <p>You haven't saved any kits yet.</p>
      <RouterLink :to="{ name: kitListRoute }" class="app-button-primary mt-2">
        Browse kits
      </RouterLink>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <article
        v-for="kit in savedKits"
        :key="kit.id"
        class="relative bg-white rounded-[22px] border border-navy-100 overflow-hidden transition duration-300 hover-glow-soft"
      >
        <RouterLink :to="{ name: kitDetailRoute, params: { id: kit.id } }" class="block">
          <div class="aspect-video accent-grid flex items-center justify-center overflow-hidden">
            <img v-if="kit.thumbnailUrl" :src="kit.thumbnailUrl" :alt="kit.title" class="w-full h-full object-cover">
            <span v-else class="text-slate-300 text-3xl">🧪</span>
          </div>
          <div class="p-4">
            <p class="text-xs text-spark-600 font-semibold mb-1">{{ kit.categoryName || 'Uncategorized' }}</p>
            <h3 class="font-display font-semibold text-navy-900">{{ kit.title }}</h3>
            <p v-if="!isCheckingAvailability && unavailableIds.has(kit.id)" class="mt-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-2 py-1 inline-block">
              No longer available
            </p>
            <span v-else-if="kit.grade" class="mt-2 inline-block text-xs rounded-md bg-slate-100 px-2 py-1 text-slate-500">{{ kit.grade }}</span>
          </div>
        </RouterLink>
        <button
          type="button"
          class="absolute top-3 right-3 z-10 text-xs font-semibold px-3 py-1.5 rounded-full bg-white/90 text-red-600 border border-red-200 hover:bg-red-50 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-400"
          :aria-label="`Remove ${kit.title} from saved kits`"
          @click="handleRemove(kit)"
        >
          Remove
        </button>
      </article>
    </div>
  </div>
</template>

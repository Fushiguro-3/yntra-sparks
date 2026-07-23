import { computed, ref, watch } from 'vue'
import { paginate } from '@/utils/paginate'

/**
 * Client-side search + pagination over an already-fetched array — the same
 * "fetch a larger batch, then filter/paginate in the component" trick
 * ProgramsView.vue already uses, extracted so the portal tables (Schools,
 * Kits, Messages, Principals, Teachers) don't each hand-roll it.
 *
 * @param {import('vue').Ref<Array>} sourceRef
 * @param {(item: any, query: string) => boolean} filterFn
 * @param {number} pageSize
 */
export function useClientTable(sourceRef, filterFn, pageSize = 10) {
  const search = ref('')
  const page = ref(0)

  const filtered = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return sourceRef.value
    return sourceRef.value.filter((item) => filterFn(item, q))
  })

  const paged = computed(() => paginate(filtered.value, page.value, pageSize))

  watch(search, () => { page.value = 0 })
  watch(sourceRef, () => { page.value = 0 })

  return { search, page, filtered, paged }
}

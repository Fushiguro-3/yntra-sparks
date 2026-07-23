import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { mockAuthService } from '@/api/mock/mockAuthService'
import { savedKitsStore } from '@/services/savedKitsStore'
import router from '@/router'

const listForMySchoolMock = vi.fn()
vi.mock('@/api/kitService', () => ({
  kitService: { listForMySchool: (...args) => listForMySchoolMock(...args) }
}))

const { default: SavedKitsView } = await import('@/views/portal/SavedKitsView.vue')

async function mountAsTeacher() {
  setActivePinia(createPinia())
  useAuthStore().isBootstrapping = false
  mockAuthService._resetDemoUsers()
  await useAuthStore().login('teacher@dps.edu.in', 'demo1234')
  await router.push({ name: 'teacher-saved-kits' })
  await router.isReady()
  const wrapper = mount(SavedKitsView, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('SavedKitsView', () => {
  beforeEach(() => {
    listForMySchoolMock.mockReset()
    listForMySchoolMock.mockResolvedValue({ content: [{ id: 1 }, { id: 2 }] })
  })

  it('shows an empty state with a Browse kits action when nothing is saved', async () => {
    const wrapper = await mountAsTeacher()
    expect(wrapper.text()).toContain("haven't saved any kits")
    expect(wrapper.findAll('a').some((a) => a.text().includes('Browse kits'))).toBe(true)
  })

  it('lists saved kits', async () => {
    const auth = useAuthStore()
    savedKitsStore.save(auth.user.id, { id: 1, title: 'Circuit Explorers', categoryName: 'Electronics', grade: 'Grade 6' })
    const wrapper = await mountAsTeacher()
    expect(wrapper.text()).toContain('Circuit Explorers')
  })

  it('flags a saved kit as no longer available when it is not in the accessible list', async () => {
    const auth = useAuthStore()
    savedKitsStore.save(auth.user.id, { id: 999, title: 'Removed Kit', categoryName: 'Robotics', grade: 'Grade 5' })
    const wrapper = await mountAsTeacher()
    expect(wrapper.text()).toContain('No longer available')
  })

  it('does not flag a saved kit that is still accessible', async () => {
    const auth = useAuthStore()
    savedKitsStore.save(auth.user.id, { id: 1, title: 'Still Here', categoryName: 'Robotics', grade: 'Grade 5' })
    const wrapper = await mountAsTeacher()
    expect(wrapper.text()).not.toContain('No longer available')
  })

  it('Remove takes a kit out of the saved list', async () => {
    const auth = useAuthStore()
    savedKitsStore.save(auth.user.id, { id: 1, title: 'To Remove', categoryName: 'Robotics', grade: 'Grade 5' })
    const wrapper = await mountAsTeacher()
    await wrapper.find(`button[aria-label="Remove To Remove from saved kits"]`).trigger('click')
    expect(wrapper.text()).not.toContain('To Remove')
    expect(savedKitsStore.isSaved(auth.user.id, 1)).toBe(false)
  })

  it('each saved kit links to its own kit detail page', async () => {
    const auth = useAuthStore()
    savedKitsStore.save(auth.user.id, { id: 42, title: 'Deep Link Kit', categoryName: 'Robotics', grade: 'Grade 5' })
    const wrapper = await mountAsTeacher()
    const link = wrapper.findAll('a').find((a) => a.text().includes('Deep Link Kit'))
    expect(link.attributes('href')).toBe('/teacher/kits/42')
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { mockAuthService } from '@/api/mock/mockAuthService'
import { profileStore } from '@/services/profileStore'
import router from '@/router'

vi.mock('@/api/schoolService', () => ({
  schoolService: { getById: vi.fn().mockResolvedValue({ id: 1, name: 'Demo Public School' }) }
}))
vi.mock('@/api/teacherService', () => ({
  teacherService: { list: vi.fn().mockResolvedValue({ totalElements: 4, content: [] }) }
}))
vi.mock('@/api/kitService', () => ({
  kitService: { listForMySchool: vi.fn().mockResolvedValue({ totalElements: 6, content: [] }) }
}))

const { default: ProfileView } = await import('@/views/portal/ProfileView.vue')

const PROFILE_ROUTE_BY_ROLE = {
  'admin@yntrasparks.com': '/admin/profile',
  'principal@dps.edu.in': '/principal/profile',
  'teacher@dps.edu.in': '/teacher/profile'
}

async function mountAsRole(email) {
  setActivePinia(createPinia())
  useAuthStore().isBootstrapping = false
  mockAuthService._resetDemoUsers()
  await router.push('/')
  await router.isReady()
  await useAuthStore().login(email, 'demo1234')
  await router.push(PROFILE_ROUTE_BY_ROLE[email])
  const wrapper = mount(ProfileView, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('ProfileView — shared profile page, role-specific sections', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders Principal-specific school overview (teacher count, assigned kits)', async () => {
    const wrapper = await mountAsRole('principal@dps.edu.in')
    expect(wrapper.text()).toContain('Principal')
    expect(wrapper.text()).toContain('School overview')
    expect(wrapper.text()).toContain('4') // teacher count
    expect(wrapper.text()).toContain('6') // assigned kits
  })

  it('renders Teacher-specific access summary', async () => {
    const wrapper = await mountAsRole('teacher@dps.edu.in')
    expect(wrapper.text()).toContain('Teacher')
    expect(wrapper.text()).toContain('Access')
    expect(wrapper.text()).toContain('Demo Public School')
  })

  it('renders Super Admin administrative access section', async () => {
    const wrapper = await mountAsRole('admin@yntrasparks.com')
    expect(wrapper.text()).toContain('Super Admin')
    expect(wrapper.text()).toContain('Administrative access')
  })

  it('never shows another role\'s section', async () => {
    const wrapper = await mountAsRole('teacher@dps.edu.in')
    expect(wrapper.text()).not.toContain('School overview') // Principal-only
    expect(wrapper.text()).not.toContain('Administrative access') // Admin-only
  })

  it('edit-profile flow validates, saves, and persists across a fresh mount (mock localStorage)', async () => {
    const wrapper = await mountAsRole('teacher@dps.edu.in')
    const userId = useAuthStore().user.id

    const editButton = wrapper.findAll('button').find((b) => b.text() === 'Edit')
    await editButton.trigger('click')

    const nameInput = wrapper.find('#profile-name')
    const form = wrapper.find('form')
    await nameInput.setValue('')
    await form.trigger('submit')
    expect(wrapper.text()).toContain('Name is required.')

    await nameInput.setValue('Updated Teacher Name')
    await form.trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Updated Teacher Name')
    expect(profileStore.get(userId).displayName).toBe('Updated Teacher Name')

    // Simulate a fresh mount (e.g. after a refresh) — the overlay should still be there.
    const remounted = mount(ProfileView, { global: { plugins: [router] } })
    await flushPromises()
    expect(remounted.text()).toContain('Updated Teacher Name')
  })
})

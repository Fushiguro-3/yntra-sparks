import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { mockAuthService } from '@/api/mock/mockAuthService'
import router from '@/router'

vi.mock('@/composables/useConfirm', () => ({
  useConfirm: () => ({ confirm: async () => true })
}))

const listMock = vi.fn()
const createMock = vi.fn()
vi.mock('@/api/teacherService', () => ({
  teacherService: {
    list: (...args) => listMock(...args),
    create: (...args) => createMock(...args),
    deactivate: vi.fn(),
    activate: vi.fn(),
    resetPassword: vi.fn()
  }
}))

const { default: TeachersView } = await import('@/views/principal/TeachersView.vue')

async function mountView(query = {}) {
  setActivePinia(createPinia())
  useAuthStore().isBootstrapping = false
  mockAuthService._resetDemoUsers()
  await useAuthStore().login('principal@dps.edu.in', 'demo1234')
  await router.push({ name: 'principal-teachers', query })
  await router.isReady()
  const wrapper = mount(TeachersView, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('TeachersView (Principal) — teacher invitations', () => {
  beforeEach(() => {
    listMock.mockReset()
    createMock.mockReset()
    listMock.mockResolvedValue({ content: [{ id: 1, name: 'Existing Teacher', email: 'existing@dps.edu.in', status: 'ACTIVE', schoolId: 1, createdAt: '2026-01-01' }] })
  })

  it('defaults to the Teachers tab; deep-links to Invitations via ?tab=invitations', async () => {
    const wrapper = await mountView()
    expect(wrapper.find('button[role="tab"][aria-selected="true"]').text()).toBe('Teachers')

    const wrapper2 = await mountView({ tab: 'invitations' })
    expect(wrapper2.text()).toContain('No invitations sent yet.')
  })

  it('sends an invitation and lists it as pending', async () => {
    const wrapper = await mountView({ tab: 'invitations' })
    const inviteButton = wrapper.findAll('button').find((b) => b.text().includes('Invite Teacher'))
    await inviteButton.trigger('click')

    await wrapper.find('#invite-name').setValue('New Teacher')
    await wrapper.find('#invite-email').setValue('newteacher@dps.edu.in')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('New Teacher')
    expect(wrapper.text()).toContain('pending')
  })

  it('prevents a duplicate pending invitation for the same email', async () => {
    const wrapper = await mountView({ tab: 'invitations' })
    const inviteButton = wrapper.findAll('button').find((b) => b.text().includes('Invite Teacher'))

    await inviteButton.trigger('click')
    await wrapper.find('#invite-name').setValue('Dup Teacher')
    await wrapper.find('#invite-email').setValue('dup@dps.edu.in')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    await inviteButton.trigger('click')
    await wrapper.find('#invite-name').setValue('Dup Teacher Two')
    await wrapper.find('#invite-email').setValue('dup@dps.edu.in')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('already a pending invitation')
  })

  it('rejects inviting an email that already belongs to an active teacher', async () => {
    const wrapper = await mountView({ tab: 'invitations' })
    const inviteButton = wrapper.findAll('button').find((b) => b.text().includes('Invite Teacher'))
    await inviteButton.trigger('click')
    await wrapper.find('#invite-name').setValue('Existing Teacher')
    await wrapper.find('#invite-email').setValue('existing@dps.edu.in')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('already belongs to an active teacher')
  })

  it('resend regenerates the invitation and keeps it pending', async () => {
    const wrapper = await mountView({ tab: 'invitations' })
    const inviteButton = wrapper.findAll('button').find((b) => b.text().includes('Invite Teacher'))
    await inviteButton.trigger('click')
    await wrapper.find('#invite-name').setValue('Resend Person')
    await wrapper.find('#invite-email').setValue('resend@dps.edu.in')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const row = wrapper.findAll('tr').find((r) => r.text().includes('Resend Person'))
    await row.findAll('button').find((b) => b.text().includes('Resend')).trigger('click')
    expect(wrapper.text()).toContain('pending')
  })

  it('revoke marks the invitation revoked (confirm stubbed to auto-confirm)', async () => {
    const wrapper = await mountView({ tab: 'invitations' })
    const inviteButton = wrapper.findAll('button').find((b) => b.text().includes('Invite Teacher'))
    await inviteButton.trigger('click')
    await wrapper.find('#invite-name').setValue('Revoke Person')
    await wrapper.find('#invite-email').setValue('revoke@dps.edu.in')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const row = wrapper.findAll('tr').find((r) => r.text().includes('Revoke Person'))
    await row.findAll('button').find((b) => b.text().includes('Revoke')).trigger('click')
    await flushPromises()
    expect(wrapper.text()).toContain('revoked')
  })

  it('simulating acceptance creates a real teacher account via teacherService.create', async () => {
    createMock.mockResolvedValue({ tempPassword: 'Temp@abc123' })
    const wrapper = await mountView({ tab: 'invitations' })
    const inviteButton = wrapper.findAll('button').find((b) => b.text().includes('Invite Teacher'))
    await inviteButton.trigger('click')
    await wrapper.find('#invite-name').setValue('Accept Person')
    await wrapper.find('#invite-email').setValue('accept@dps.edu.in')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const row = wrapper.findAll('tr').find((r) => r.text().includes('Accept Person'))
    await row.findAll('button').find((b) => b.text().includes('Simulate acceptance')).trigger('click')
    await flushPromises()

    expect(createMock).toHaveBeenCalledWith(1, { name: 'Accept Person', email: 'accept@dps.edu.in' })
    expect(wrapper.text()).toContain('Temp@abc123') // temp password reveal modal
  })
})

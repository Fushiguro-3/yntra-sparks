import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { mockAuthService } from '@/api/mock/mockAuthService'
import router from '@/router'

// Confirm dialogs are a separate component mounted once in App.vue — in a
// component test that only mounts MessagesView, nothing would ever resolve
// the confirm() promise, so it's stubbed here to auto-confirm.
vi.mock('@/composables/useConfirm', () => ({
  useConfirm: () => ({ confirm: async () => true })
}))

const listMock = vi.fn()
const markReadMock = vi.fn()
const markUnreadMock = vi.fn()
const archiveMock = vi.fn()
const restoreMock = vi.fn()
const deleteMock = vi.fn()
vi.mock('@/services/messagesService', () => ({
  messagesService: {
    list: (...args) => listMock(...args),
    markRead: (...args) => markReadMock(...args),
    markUnread: (...args) => markUnreadMock(...args),
    archive: (...args) => archiveMock(...args),
    restore: (...args) => restoreMock(...args),
    delete: (...args) => deleteMock(...args)
  }
}))

const { default: MessagesView } = await import('@/views/superadmin/MessagesView.vue')

const baseMessages = [
  { id: 1, name: 'Alice', email: 'alice@example.com', subject: 'Hello', message: 'Hi there', source: 'backend', createdAt: '2026-01-01T10:00:00', status: 'unread' },
  { id: 2, name: 'Bob', email: 'bob@example.com', subject: 'Question', message: 'A question', source: 'web3forms', createdAt: '2026-01-02T10:00:00', status: 'read' },
  { id: 3, name: 'Carol', email: 'carol@example.com', subject: 'Archived one', message: 'Old', source: 'backend', createdAt: '2026-01-03T10:00:00', status: 'archived' }
]

async function mountView(query = {}) {
  setActivePinia(createPinia())
  useAuthStore().isBootstrapping = false
  mockAuthService._resetDemoUsers()
  // The route guard requires an authenticated Super Admin — without this,
  // navigating to admin-messages redirects to /login and route.query never
  // carries the `tab` param the deep-link test below depends on.
  await useAuthStore().login('admin@yntrasparks.com', 'demo1234')
  await router.push({ name: 'admin-messages', query })
  await router.isReady()
  const wrapper = mount(MessagesView, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('MessagesView', () => {
  beforeEach(() => {
    listMock.mockReset()
    markReadMock.mockReset()
    markUnreadMock.mockReset()
    archiveMock.mockReset()
    restoreMock.mockReset()
    deleteMock.mockReset()
    // Cloned per test — MessagesView mutates message objects in place
    // (patchLocalStatus), so reusing the same object references across
    // tests would leak status changes between unrelated tests.
    listMock.mockResolvedValue({ content: baseMessages.map((m) => ({ ...m })), totalElements: 3, totalPages: 1 })
  })

  it('defaults to the Inbox tab, which excludes archived messages', async () => {
    const wrapper = await mountView()
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('Bob')
    expect(wrapper.text()).not.toContain('Carol')
  })

  it('the Unread tab shows only unread messages', async () => {
    const wrapper = await mountView()
    await wrapper.findAll('button[role="tab"]').find((b) => b.text().includes('Unread')).trigger('click')
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).not.toContain('Bob')
  })

  it('the Archived tab shows only archived messages', async () => {
    const wrapper = await mountView()
    await wrapper.findAll('button[role="tab"]').find((b) => b.text().includes('Archived')).trigger('click')
    expect(wrapper.text()).toContain('Carol')
    expect(wrapper.text()).not.toContain('Alice')
  })

  it('deep-links to the Unread tab via ?tab=unread (used by the Dashboard card)', async () => {
    const wrapper = await mountView({ tab: 'unread' })
    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).not.toContain('Bob')
  })

  it('opening a message (View) marks an unread message read', async () => {
    const wrapper = await mountView()
    const row = wrapper.findAll('tr').find((r) => r.text().includes('Alice'))
    await row.findAll('button').find((b) => b.text() === 'View').trigger('click')
    expect(markReadMock).toHaveBeenCalled()
  })

  it('Mark unread is available for a read message and calls the service', async () => {
    const wrapper = await mountView()
    const row = wrapper.findAll('tr').find((r) => r.text().includes('Bob'))
    await row.findAll('button').find((b) => b.text().includes('Mark unread')).trigger('click')
    expect(markUnreadMock).toHaveBeenCalled()
  })

  it('Archive moves a message out of the default Inbox view', async () => {
    const wrapper = await mountView()
    const row = wrapper.findAll('tr').find((r) => r.text().includes('Alice'))
    await row.findAll('button').find((b) => b.text().includes('Archive')).trigger('click')
    expect(archiveMock).toHaveBeenCalled()
    expect(wrapper.text()).not.toContain('Alice')
  })

  it('Restore brings an archived message back and calls the service', async () => {
    const wrapper = await mountView()
    await wrapper.findAll('button[role="tab"]').find((b) => b.text().includes('Archived')).trigger('click')
    const row = wrapper.findAll('tr').find((r) => r.text().includes('Carol'))
    await row.findAll('button').find((b) => b.text().includes('Restore')).trigger('click')
    expect(restoreMock).toHaveBeenCalled()
  })

  it('search filters by name, email, subject, or message body', async () => {
    const wrapper = await mountView()
    await wrapper.find('input[type="search"]').setValue('question')
    expect(wrapper.text()).toContain('Bob')
    expect(wrapper.text()).not.toContain('Alice')
  })

  it('Delete requires confirmation (stubbed to auto-confirm here) and calls the service', async () => {
    const wrapper = await mountView()
    const row = wrapper.findAll('tr').find((r) => r.text().includes('Alice'))
    await row.findAll('button').find((b) => b.text().includes('Delete')).trigger('click')
    await flushPromises()
    expect(deleteMock).toHaveBeenCalled()
  })
})

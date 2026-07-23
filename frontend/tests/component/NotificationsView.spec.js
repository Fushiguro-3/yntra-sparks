import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { mockAuthService } from '@/api/mock/mockAuthService'
import { notificationStore } from '@/services/notificationStore'
import router from '@/router'
import NotificationsView from '@/views/portal/NotificationsView.vue'

async function mountAsAdmin() {
  setActivePinia(createPinia())
  useAuthStore().isBootstrapping = false
  mockAuthService._resetDemoUsers()
  await useAuthStore().login('admin@yntrasparks.com', 'demo1234')
  await router.push({ name: 'admin-notifications' })
  await router.isReady()
  const wrapper = mount(NotificationsView, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('NotificationsView', () => {
  beforeEach(() => {})

  it('shows an empty state when there are no notifications', async () => {
    const wrapper = await mountAsAdmin()
    expect(wrapper.text()).toContain("don't have any notifications yet")
  })

  it('lists notifications with unread visually and semantically distinguished', async () => {
    const auth = useAuthStore()
    notificationStore.add(auth.user.id, { type: 't', title: 'New message', message: 'From Alice' })
    const wrapper = await mountAsAdmin()
    expect(wrapper.text()).toContain('New message')
    expect(wrapper.text()).toContain('Unread')
  })

  it('the Unread filter hides read notifications', async () => {
    const auth = useAuthStore()
    notificationStore.add(auth.user.id, { type: 't', title: 'Unread one', message: 'm' })
    const readOne = notificationStore.add(auth.user.id, { type: 't', title: 'Read one', message: 'm' })
    notificationStore.markRead(auth.user.id, readOne[0].id)

    const wrapper = await mountAsAdmin()
    await wrapper.findAll('button[role="tab"]').find((b) => b.text().includes('Unread')).trigger('click')
    expect(wrapper.text()).toContain('Unread one')
    expect(wrapper.text()).not.toContain('Read one')
  })

  it('clicking a notification marks it read', async () => {
    const auth = useAuthStore()
    notificationStore.add(auth.user.id, { type: 't', title: 'Click target', message: 'm' })
    const wrapper = await mountAsAdmin()
    // The notification row itself (not an ancestor) — matches the template's
    // per-item wrapper class so the click lands on the element that actually
    // owns the @click handler.
    const item = wrapper.findAll('.px-5.py-4').find((el) => el.text().includes('Click target'))
    await item.trigger('click')
    await flushPromises()
    expect(notificationStore.list(auth.user.id)[0].read).toBe(true)
  })

  it('Mark all read clears every unread flag', async () => {
    const auth = useAuthStore()
    notificationStore.add(auth.user.id, { type: 't', title: 'A', message: 'm' })
    notificationStore.add(auth.user.id, { type: 't', title: 'B', message: 'm' })
    const wrapper = await mountAsAdmin()
    await wrapper.findAll('button').find((b) => b.text().includes('Mark all read')).trigger('click')
    expect(notificationStore.list(auth.user.id).every((n) => n.read)).toBe(true)
  })

  it('Dismiss removes a notification from the list', async () => {
    const auth = useAuthStore()
    notificationStore.add(auth.user.id, { type: 't', title: 'Dismiss me', message: 'm' })
    const wrapper = await mountAsAdmin()
    await wrapper.findAll('button').find((b) => b.text().includes('Dismiss')).trigger('click')
    expect(wrapper.text()).not.toContain('Dismiss me')
    expect(notificationStore.list(auth.user.id)).toEqual([])
  })
})

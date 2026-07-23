import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'
import NotificationBell from '@/components/portal/NotificationBell.vue'
import { notificationStore } from '@/services/notificationStore'

function mountBell(userId, viewAllRoute = 'admin-notifications') {
  return mount(NotificationBell, {
    props: { userId, viewAllRoute },
    global: { plugins: [router] },
    attachTo: document.body
  })
}

describe('NotificationBell', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    useAuthStore().isBootstrapping = false
    await router.push('/')
    await router.isReady()
  })

  it('shows no unread badge when there are no notifications', () => {
    const wrapper = mountBell('bell-user-1')
    expect(wrapper.find('button[aria-label="Notifications"] span[aria-hidden="true"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('shows an unread badge count', () => {
    notificationStore.add('bell-user-2', { type: 't', title: 'A', message: 'm' })
    notificationStore.add('bell-user-2', { type: 't', title: 'B', message: 'm' })
    const wrapper = mountBell('bell-user-2')
    expect(wrapper.find('button[aria-label="Notifications"]').text()).toContain('2')
    wrapper.unmount()
  })

  it('opens on trigger click and lists recent notifications', async () => {
    notificationStore.add('bell-user-3', { type: 't', title: 'Hello', message: 'World' })
    const wrapper = mountBell('bell-user-3')
    await wrapper.find('button[aria-label="Notifications"]').trigger('click')
    expect(wrapper.text()).toContain('Hello')
    expect(wrapper.text()).toContain('World')
    wrapper.unmount()
  })

  it('clicking a notification marks it read and closes the dropdown', async () => {
    notificationStore.add('bell-user-4', { type: 't', title: 'Click me', message: 'm' })
    const wrapper = mountBell('bell-user-4')
    await wrapper.find('button[aria-label="Notifications"]').trigger('click')
    const item = wrapper.findAll('a').find((a) => a.text().includes('Click me'))
    await item.trigger('click')
    await flushPromises()
    expect(wrapper.find('[role="menu"], .absolute.right-0.mt-2').exists()).toBe(false)
    expect(notificationStore.list('bell-user-4')[0].read).toBe(true)
  })

  it('Mark all read clears the unread badge', async () => {
    notificationStore.add('bell-user-5', { type: 't', title: 'A', message: 'm' })
    notificationStore.add('bell-user-5', { type: 't', title: 'B', message: 'm' })
    const wrapper = mountBell('bell-user-5')
    await wrapper.find('button[aria-label="Notifications"]').trigger('click')
    const markAllButton = wrapper.findAll('button').find((b) => b.text().includes('Mark all read'))
    await markAllButton.trigger('click')
    expect(notificationStore.list('bell-user-5').every((n) => n.read)).toBe(true)
    wrapper.unmount()
  })

  it('closes on Escape and restores focus to the trigger', async () => {
    const wrapper = mountBell('bell-user-6')
    const trigger = wrapper.find('button[aria-label="Notifications"]')
    await trigger.trigger('click')
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(document.activeElement).toBe(trigger.element)
    wrapper.unmount()
  })

  it('closes on an outside click', async () => {
    const wrapper = mountBell('bell-user-7')
    await wrapper.find('button[aria-label="Notifications"]').trigger('click')
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushPromises()
    expect(wrapper.findAll('button').some((b) => b.text().includes('Mark all read'))).toBe(false)
    wrapper.unmount()
  })

  it('only ever links to a whitelisted route, never an arbitrary target', async () => {
    notificationStore.add('bell-user-8', {
      type: 't',
      title: 'Tampered',
      message: 'm',
      to: { name: 'javascript:alert(1)' }
    })
    const wrapper = mountBell('bell-user-8')
    await wrapper.find('button[aria-label="Notifications"]').trigger('click')
    const link = wrapper.findAll('a').find((a) => a.text().includes('Tampered'))
    expect(link.attributes('href')).toBe('/admin/notifications')
    wrapper.unmount()
  })
})

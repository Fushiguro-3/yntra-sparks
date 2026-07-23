import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { mockAuthService } from '@/api/mock/mockAuthService'
import router from '@/router'
import UserMenu from '@/components/portal/UserMenu.vue'

function mountMenu(props = {}) {
  return mount(UserMenu, {
    props: {
      name: 'Demo Admin',
      email: 'admin@yntrasparks.com',
      roleLabel: 'Super Admin',
      dashboardRoute: 'admin-dashboard',
      profileRoute: 'admin-profile',
      ...props
    },
    global: { plugins: [router] },
    attachTo: document.body
  })
}

describe('UserMenu (shared portal top-right user menu)', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    useAuthStore().isBootstrapping = false
    mockAuthService._resetDemoUsers()
    await router.push('/admin/schools')
    await router.isReady()
  })

  it('shows initials derived from the name, plus name and role', () => {
    const wrapper = mountMenu()
    expect(wrapper.text()).toContain('DA')
    expect(wrapper.text()).toContain('Demo Admin')
    expect(wrapper.text()).toContain('Super Admin')
  })

  it('is closed by default and opens on trigger click', async () => {
    const wrapper = mountMenu()
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)

    await wrapper.find('button[aria-label="Account menu"]').trigger('click')
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)
    wrapper.unmount()
  })

  it('contains My Profile, Dashboard, Change Password, and Logout', async () => {
    const wrapper = mountMenu()
    await wrapper.find('button[aria-label="Account menu"]').trigger('click')

    const items = wrapper.findAll('[role="menuitem"]').map((el) => el.text())
    expect(items).toEqual(expect.arrayContaining(['Dashboard', 'My Profile', 'Change Password', 'Log out']))
    wrapper.unmount()
  })

  it('shows a Notifications item only when a notificationsRoute is supplied', async () => {
    // Uses an existing route name only to prove the conditional-rendering
    // behavior — the real notifications route is wired up separately.
    const withNotifications = mountMenu({ notificationsRoute: 'admin-dashboard' })
    await withNotifications.find('button[aria-label="Account menu"]').trigger('click')
    expect(withNotifications.findAll('[role="menuitem"]').some((el) => el.text() === 'Notifications')).toBe(true)
    withNotifications.unmount()

    const without = mountMenu()
    await without.find('button[aria-label="Account menu"]').trigger('click')
    expect(without.findAll('[role="menuitem"]').some((el) => el.text() === 'Notifications')).toBe(false)
    without.unmount()
  })

  it('renders an avatar image instead of initials when avatarUrl is provided', () => {
    const wrapper = mountMenu({ avatarUrl: 'https://example.com/a.png' })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://example.com/a.png')
  })

  it('closes on Escape and restores focus to the trigger', async () => {
    const wrapper = mountMenu()
    const trigger = wrapper.find('button[aria-label="Account menu"]')
    await trigger.trigger('click')
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    expect(document.activeElement).toBe(trigger.element)
    wrapper.unmount()
  })

  it('closes on an outside click', async () => {
    const wrapper = mountMenu()
    await wrapper.find('button[aria-label="Account menu"]').trigger('click')
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await flushPromises()
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    wrapper.unmount()
  })

  it('closes on route change', async () => {
    const wrapper = mountMenu()
    await wrapper.find('button[aria-label="Account menu"]').trigger('click')
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)

    await router.push('/admin/kits')
    await flushPromises()
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    wrapper.unmount()
    await router.push('/admin/schools')
  })

  it('emits a logout event when Log out is clicked', async () => {
    const wrapper = mountMenu()
    await wrapper.find('button[aria-label="Account menu"]').trigger('click')
    const logoutItem = wrapper.findAll('[role="menuitem"]').find((el) => el.text() === 'Log out')
    await logoutItem.trigger('click')
    expect(wrapper.emitted('logout')).toBeTruthy()
    wrapper.unmount()
  })
})

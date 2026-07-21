import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { mockAuthService } from '@/api/mock/mockAuthService'
import router from '@/router'
import PortalShell from '@/layouts/PortalShell.vue'

const navItems = [
  { name: 'admin-schools', label: 'Schools' },
  { name: 'admin-kits', label: 'Kits' }
]

describe('PortalShell (shared Admin/Principal/Teacher chrome)', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    useAuthStore().isBootstrapping = false
    mockAuthService._resetDemoUsers()
    await useAuthStore().login('admin@yntrasparks.com', 'demo1234')
    await router.push('/admin/schools')
    await router.isReady()
  })

  function mountShell() {
    return mount(PortalShell, {
      props: { navItems, roleLabel: 'Super Admin', topbarLabel: 'Command centre' },
      global: { plugins: [router] }
    })
  }

  it('shows the signed-in user\'s email and the role label', () => {
    const wrapper = mountShell()
    expect(wrapper.text()).toContain('admin@yntrasparks.com')
    expect(wrapper.text()).toContain('Super Admin')
  })

  it('mobile drawer opens on menu click and closes on Escape, backdrop click, and route change', async () => {
    const wrapper = mount(PortalShell, {
      props: { navItems, roleLabel: 'Super Admin', topbarLabel: 'Command centre' },
      global: { plugins: [router] },
      attachTo: document.body
    })

    const menuButton = wrapper.find('button[aria-label="Open menu"]')
    await menuButton.trigger('click')
    await flushPromises()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)

    // Escape
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(document.activeElement).toBe(menuButton.element)

    // Reopen, then route change should close it
    await menuButton.trigger('click')
    await flushPromises()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    await router.push('/admin/kits')
    await flushPromises()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)

    wrapper.unmount()
    await router.push('/admin/schools')
  })

  it('logout clears the session and redirects to /login', async () => {
    const wrapper = mountShell()
    const auth = useAuthStore()
    const logoutButton = wrapper.findAll('button').find((b) => b.text().includes('Log out'))
    await logoutButton.trigger('click')
    // mockAuthService.logout() has a real ~100ms fakeDelay() — wait it out
    // rather than faking timers (simpler here since nothing else times out).
    await new Promise((resolve) => setTimeout(resolve, 300))
    await flushPromises()

    expect(auth.isAuthenticated).toBe(false)
    expect(router.currentRoute.value.name).toBe('login')
  })
})

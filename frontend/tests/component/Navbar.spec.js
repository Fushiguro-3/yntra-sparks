import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { mockAuthService } from '@/api/mock/mockAuthService'
import router from '@/router'
import Navbar from '@/components/public/Navbar.vue'

async function mountNavbar() {
  const wrapper = mount(Navbar, { global: { plugins: [router] } })
  await flushPromises()
  return wrapper
}

describe('Navbar — active route highlighting (regression test for the Home-always-active bug)', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    useAuthStore().isBootstrapping = false
    mockAuthService._resetDemoUsers()
    await router.push('/')
    await router.isReady()
  })

  it('marks Home active (aria-current="page") on the exact home route only', async () => {
    await router.push('/')
    const wrapper = await mountNavbar()
    const home = wrapper.findAll('nav[aria-label="Primary"] a').find((a) => a.text() === 'Home')
    expect(home.attributes('aria-current')).toBe('page')
  })

  it('does not leave Home marked active on the About route', async () => {
    await router.push('/programs')
    const wrapper = await mountNavbar()
    const links = wrapper.findAll('nav[aria-label="Primary"] a')
    const home = links.find((a) => a.text() === 'Home')
    const about = links.find((a) => a.text() === 'Programs')

    expect(home.attributes('aria-current')).toBeFalsy()
    expect(about.attributes('aria-current')).toBe('page')
  })

  it('marks Categories active on the categories route, not Home', async () => {
    await router.push('/categories')
    const wrapper = await mountNavbar()
    const links = wrapper.findAll('nav[aria-label="Primary"] a')
    expect(links.find((a) => a.text() === 'Categories').attributes('aria-current')).toBe('page')
    expect(links.find((a) => a.text() === 'Home').attributes('aria-current')).toBeFalsy()
  })

  it('marks Contact active on the contact route', async () => {
    await router.push('/contact')
    const wrapper = await mountNavbar()
    const links = wrapper.findAll('nav[aria-label="Primary"] a')
    expect(links.find((a) => a.text() === 'Contact').attributes('aria-current')).toBe('page')
  })

  it('marks the Grades trigger active on the grades route', async () => {
    await router.push('/grades')
    const wrapper = await mountNavbar()
    const gradesButton = wrapper.findAll('button').find((b) => b.text().includes('Grades'))
    expect(gradesButton.attributes('aria-current')).toBe('page')
  })

  it('the mobile drawer link list agrees with the desktop nav on what is active', async () => {
    await router.push('/programs')
    const wrapper = await mountNavbar()
    await wrapper.find('button[aria-label="Open menu"]').trigger('click')
    await flushPromises()

    const drawerLinks = wrapper.findAll('nav[aria-label="Mobile"] a')
    const about = drawerLinks.find((a) => a.text() === 'Programs')
    const home = drawerLinks.find((a) => a.text() === 'Home')
    expect(about.attributes('aria-current')).toBe('page')
    expect(home.attributes('aria-current')).toBeFalsy()
  })
})

describe('Navbar — Login / Dashboard CTA', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    useAuthStore().isBootstrapping = false
    mockAuthService._resetDemoUsers()
    await router.push('/')
    await router.isReady()
  })

  it('shows a Login CTA (and not a Dashboard CTA) for an unauthenticated visitor', async () => {
    const wrapper = await mountNavbar()
    expect(wrapper.text()).toContain('Login')
    expect(wrapper.text()).not.toContain('Go to Dashboard')
    // "Get in touch" CTA button is gone — Contact lives only as a regular nav item now.
    expect(wrapper.findAll('a').filter((a) => a.text() === 'Get in touch')).toHaveLength(0)
  })

  it('shows a Dashboard CTA instead of Login once authenticated, never both', async () => {
    const auth = useAuthStore()
    await auth.login('teacher@dps.edu.in', 'demo1234')
    const wrapper = await mountNavbar()

    const ctaArea = wrapper.find('.lg\\:flex.items-center.gap-3')
    expect(ctaArea.text()).toContain('Go to Dashboard')
    expect(ctaArea.text()).not.toContain('Login')
  })

  it('routes the Dashboard CTA to the authenticated user\'s role-specific home', async () => {
    const auth = useAuthStore()
    await auth.login('admin@yntrasparks.com', 'demo1234')
    const wrapper = await mountNavbar()

    const dashboardLink = wrapper.findAll('a').find((a) => a.text() === 'Go to Dashboard')
    expect(dashboardLink.attributes('href')).toBe('/admin')
  })
})

describe('Navbar — mobile drawer behavior', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    useAuthStore().isBootstrapping = false
    mockAuthService._resetDemoUsers()
    await router.push('/')
    await router.isReady()
  })

  it('opens on menu button click and closes on Escape, restoring focus to the trigger', async () => {
    const wrapper = mount(Navbar, { global: { plugins: [router] }, attachTo: document.body })
    await flushPromises()

    const menuButton = wrapper.find('button[aria-label="Open menu"]')
    await menuButton.trigger('click')
    await flushPromises()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await flushPromises()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(document.activeElement).toBe(menuButton.element)

    wrapper.unmount()
  })

  it('closes when the backdrop is clicked', async () => {
    const wrapper = mount(Navbar, { global: { plugins: [router] } })
    await wrapper.find('button[aria-label="Open menu"]').trigger('click')
    await flushPromises()

    await wrapper.find('.fixed.inset-0.z-50.bg-ink-900\\/40').trigger('click')
    await flushPromises()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('closes automatically on route change', async () => {
    const wrapper = mount(Navbar, { global: { plugins: [router] } })
    await wrapper.find('button[aria-label="Open menu"]').trigger('click')
    await flushPromises()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)

    await router.push('/programs')
    await flushPromises()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })
})

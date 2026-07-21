import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { mockAuthService } from '@/api/mock/mockAuthService'

const pushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: pushMock })
}))

const { default: ChangePasswordView } = await import('@/views/ChangePasswordView.vue')

describe('ChangePasswordView', () => {
  let auth

  beforeEach(async () => {
    setActivePinia(createPinia())
    pushMock.mockClear()
    mockAuthService._resetDemoUsers()
    auth = useAuthStore()
    await auth.login('newteacher@dps.edu.in', 'temp1234') // the demo mustChangePassword account
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  async function fill(wrapper, { current = 'temp1234', next = 'newpass123', confirm = 'newpass123' } = {}) {
    await wrapper.find('#current-password').setValue(current)
    await wrapper.find('#new-password').setValue(next)
    await wrapper.find('#confirm-password').setValue(confirm)
  }

  it('rejects a new password shorter than 8 characters', async () => {
    const wrapper = mount(ChangePasswordView)
    await fill(wrapper, { next: 'short1', confirm: 'short1' })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('at least 8 characters')
  })

  it('rejects a new password without both a letter and a number', async () => {
    const wrapper = mount(ChangePasswordView)
    await fill(wrapper, { next: 'onlyletters', confirm: 'onlyletters' })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('include at least one letter and one number')
  })

  it('rejects when confirm does not match the new password', async () => {
    const wrapper = mount(ChangePasswordView)
    await fill(wrapper, { next: 'newpass123', confirm: 'different123' })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('Passwords do not match.')
  })

  it('rejects a new password identical to the current password', async () => {
    const wrapper = mount(ChangePasswordView)
    await fill(wrapper, { current: 'temp1234', next: 'temp1234', confirm: 'temp1234' })
    await wrapper.find('form').trigger('submit')
    expect(wrapper.text()).toContain('must be different from your current password')
  })

  it('shows a strength hint that reacts to the new password value', async () => {
    const wrapper = mount(ChangePasswordView)
    await wrapper.find('#new-password').setValue('Str0ng!Password')
    expect(wrapper.find('#password-strength').text()).toContain('Strong')
  })

  it('surfaces the backend error on an incorrect current password and does not clear mustChangePassword', async () => {
    vi.useFakeTimers()
    const wrapper = mount(ChangePasswordView)
    await fill(wrapper, { current: 'wrong-password' })
    await wrapper.find('form').trigger('submit')
    await vi.advanceTimersByTimeAsync(500) // mockAuthService.changePassword's fakeDelay()
    await flushPromises()

    expect(wrapper.text()).toContain('Current password is incorrect')
    expect(auth.mustChangePassword).toBe(true)
  })

  it('updates the password, shows a success state, and redirects to the role home', async () => {
    vi.useFakeTimers()
    const wrapper = mount(ChangePasswordView)
    await fill(wrapper)
    await wrapper.find('form').trigger('submit')
    await vi.advanceTimersByTimeAsync(500) // mockAuthService.changePassword's fakeDelay()
    await flushPromises()

    expect(wrapper.text()).toContain('Password updated')
    expect(auth.mustChangePassword).toBe(false)

    await vi.advanceTimersByTimeAsync(1000) // the component's own redirect setTimeout
    expect(pushMock).toHaveBeenCalledWith(auth.homePath)
  })

  it('"Not you? Log out" logs out and redirects to /login', async () => {
    vi.useFakeTimers()
    const wrapper = mount(ChangePasswordView)
    const logoutButton = wrapper.findAll('button').find((b) => b.text().includes('Log out'))
    await logoutButton.trigger('click')
    await vi.advanceTimersByTimeAsync(500) // auth.logout()'s fakeDelay()
    await flushPromises()

    expect(auth.isAuthenticated).toBe(false)
    expect(pushMock).toHaveBeenCalledWith('/login')
  })
})

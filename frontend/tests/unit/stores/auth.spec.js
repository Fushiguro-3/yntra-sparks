import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { mockAuthService } from '@/api/mock/mockAuthService'

// Runs against the real mock auth service (VITE_USE_MOCK defaults to true
// whenever the var is unset — see src/config.js), not a stubbed double, so
// these tests double as coverage of mockAuthService itself.
describe('auth store', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    mockAuthService._resetDemoUsers() // undo any changePassword() mutation from a prior test
  })

  it('login stores the access token and user on success', async () => {
    const auth = useAuthStore()
    const user = await auth.login('admin@yntrasparks.com', 'demo1234')

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.role).toBe('SUPER_ADMIN')
    expect(auth.homePath).toBe('/admin')
    expect(user.email).toBe('admin@yntrasparks.com')
  })

  it('login rejects with a message on bad credentials and leaves state unauthenticated', async () => {
    const auth = useAuthStore()
    await expect(auth.login('nope@example.com', 'wrong')).rejects.toMatchObject({
      message: expect.any(String)
    })
    expect(auth.isAuthenticated).toBe(false)
  })

  it('mustChangePassword getter reflects the demo "freshly created" account', async () => {
    const auth = useAuthStore()
    await auth.login('newteacher@dps.edu.in', 'temp1234')
    expect(auth.mustChangePassword).toBe(true)
  })

  it('changePassword clears mustChangePassword on success', async () => {
    const auth = useAuthStore()
    await auth.login('newteacher@dps.edu.in', 'temp1234')
    await auth.changePassword('temp1234', 'newpass123')
    expect(auth.mustChangePassword).toBe(false)
  })

  it('changePassword rejects on a wrong current password and does not clear the flag', async () => {
    const auth = useAuthStore()
    await auth.login('newteacher@dps.edu.in', 'temp1234')
    await expect(auth.changePassword('wrong-current', 'newpass123')).rejects.toBeTruthy()
    expect(auth.mustChangePassword).toBe(true)
  })

  it('logout clears local session state', async () => {
    const auth = useAuthStore()
    await auth.login('admin@yntrasparks.com', 'demo1234')
    await auth.logout()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBeNull()
    expect(auth.accessToken).toBeNull()
  })

  it('bootstrap restores an existing session via refresh + me', async () => {
    // Simulates a hard refresh: a session already exists (mock "cookie"),
    // but this is a brand new store instance, same as App.vue on mount.
    await mockAuthService.login('teacher@dps.edu.in', 'demo1234')
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)

    await auth.bootstrap()

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user.role).toBe('TEACHER')
    expect(auth.isBootstrapping).toBe(false)
  })

  it('bootstrap clears state cleanly when there is no session to restore', async () => {
    const auth = useAuthStore()
    await auth.bootstrap()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.isBootstrapping).toBe(false)
  })
})

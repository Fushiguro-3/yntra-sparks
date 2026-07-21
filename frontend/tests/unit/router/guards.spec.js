import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { mockAuthService } from '@/api/mock/mockAuthService'
import router from '@/router'

describe('router guards (router/index.js beforeEach)', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    // The guard's very first line waits on isBootstrapping for every
    // navigation, public routes included — flip it before the initial
    // push below or every test hangs waiting on a bootstrap() that
    // never runs in these tests.
    useAuthStore().isBootstrapping = false
    mockAuthService._resetDemoUsers()
    await router.push('/')
  })

  it('redirects unauthenticated users away from role-gated routes, preserving the intended destination', async () => {
    await router.push('/admin/schools')
    expect(router.currentRoute.value.name).toBe('login')
    expect(router.currentRoute.value.query.redirect).toBe('/admin/schools')
  })

  it('sends an authenticated wrong-role user to an explicit 403, never a silent redirect', async () => {
    const auth = useAuthStore()
    await auth.login('teacher@dps.edu.in', 'demo1234')
    await router.push('/admin/schools')
    expect(router.currentRoute.value.name).toBe('forbidden')
  })

  it('lets a correctly-roled user through to their own dashboard', async () => {
    const auth = useAuthStore()
    await auth.login('principal@dps.edu.in', 'demo1234')
    await router.push('/principal/teachers')
    expect(router.currentRoute.value.name).toBe('principal-teachers')
  })

  it('bounces an authenticated user away from the guest-only /login route', async () => {
    const auth = useAuthStore()
    await auth.login('admin@yntrasparks.com', 'demo1234')
    await router.push('/login')
    expect(router.currentRoute.value.path.startsWith('/admin')).toBe(true)
  })

  it('forces a mustChangePassword user to /change-password instead of their dashboard', async () => {
    const auth = useAuthStore()
    await auth.login('newteacher@dps.edu.in', 'temp1234')
    await router.push('/teacher/kits')
    expect(router.currentRoute.value.name).toBe('change-password')
  })

  it('does not redirect away from /change-password itself while the flag is set (no redirect loop)', async () => {
    const auth = useAuthStore()
    await auth.login('newteacher@dps.edu.in', 'temp1234')
    await router.push('/change-password')
    expect(router.currentRoute.value.name).toBe('change-password')
  })

  it('sends a compliant user away from /change-password back to their dashboard', async () => {
    const auth = useAuthStore()
    await auth.login('teacher@dps.edu.in', 'demo1234')
    await router.push('/change-password')
    expect(router.currentRoute.value.name).not.toBe('change-password')
  })

  it('allows public routes without authentication', async () => {
    await router.push('/programs')
    expect(router.currentRoute.value.name).toBe('public-programs')
  })
})

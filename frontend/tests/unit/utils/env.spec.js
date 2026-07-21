import { describe, it, expect, beforeEach, vi } from 'vitest'

// env.js reads import.meta.env once at module-evaluation time, so each test
// stubs env vars and re-imports the module fresh via vi.resetModules() —
// otherwise every test after the first would see whatever the first test's
// import.meta.env snapshot was.
describe('utils/env', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('isFeatureConfigured is false for web3forms/buttondown when their env vars are unset', async () => {
    vi.stubEnv('VITE_WEB3FORMS_ACCESS_KEY', '')
    vi.stubEnv('VITE_BUTTONDOWN_USERNAME', '')
    const { isFeatureConfigured } = await import('@/utils/env')

    expect(isFeatureConfigured('web3forms')).toBe(false)
    expect(isFeatureConfigured('buttondown')).toBe(false)
  })

  it('isFeatureConfigured is true once the corresponding env var is set', async () => {
    vi.stubEnv('VITE_WEB3FORMS_ACCESS_KEY', 'test-key')
    vi.stubEnv('VITE_BUTTONDOWN_USERNAME', 'test-user')
    const { isFeatureConfigured } = await import('@/utils/env')

    expect(isFeatureConfigured('web3forms')).toBe(true)
    expect(isFeatureConfigured('buttondown')).toBe(true)
  })

  it('validateEnv reports every missing optional var without throwing', async () => {
    vi.stubEnv('VITE_WEB3FORMS_ACCESS_KEY', '')
    vi.stubEnv('VITE_BUTTONDOWN_USERNAME', '')
    const { validateEnv } = await import('@/utils/env')

    const result = validateEnv()
    expect(result.valid).toBe(false)
    expect(result.missing.length).toBeGreaterThanOrEqual(2)
  })

  it('validateEnv reports fully valid when both are configured', async () => {
    vi.stubEnv('VITE_WEB3FORMS_ACCESS_KEY', 'test-key')
    vi.stubEnv('VITE_BUTTONDOWN_USERNAME', 'test-user')
    const { validateEnv } = await import('@/utils/env')

    expect(validateEnv().valid).toBe(true)
  })

  it('demoMode defaults to useMock when VITE_DEMO_MODE is unset', async () => {
    vi.stubEnv('VITE_USE_MOCK', 'true')
    vi.stubEnv('VITE_DEMO_MODE', '')
    const { env } = await import('@/utils/env')
    expect(env.demoMode).toBe(true)
  })
})

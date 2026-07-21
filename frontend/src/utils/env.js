// Centralized, typed access to import.meta.env plus startup validation.
// USE_MOCK stays in @/config (many files already import it from there) —
// this module wraps everything else so components never read
// import.meta.env directly.
import { USE_MOCK } from '@/config'

function readBool(value, fallback) {
  if (value === undefined || value === '') return fallback
  return value === 'true'
}

export const env = {
  useMock: USE_MOCK,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || '/api',

  // Web3Forms (public contact form → email delivery, see ContactView.vue)
  web3formsAccessKey: import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || '',

  // Buttondown (newsletter subscription, see NewsletterForm.vue)
  buttondownUsername: import.meta.env.VITE_BUTTONDOWN_USERNAME || '',

  // Demo mode banner shown to authenticated users. Defaults to USE_MOCK
  // (mock data *is* demo mode) but can be overridden independently, e.g.
  // to show the banner against a staging backend seeded with demo data.
  demoMode: readBool(import.meta.env.VITE_DEMO_MODE, USE_MOCK),

  // Feature flags for functionality built ahead of documented MVP scope.
  // See docs/decisions.md ADR-0XX and docs/requirements.md §3 (Out of
  // Scope / Future Enhancements) for why these exist. Both default ON —
  // the features stay fully functional today; the flags exist so a
  // future rollout can gate them per-environment without a code change.
  featureKitPricing: readBool(import.meta.env.VITE_FEATURE_KIT_PRICING, true),
  featureKitManuals: readBool(import.meta.env.VITE_FEATURE_KIT_MANUALS, true),

  // Not wired to any library yet — placeholders reserved for future use.
  analyticsId: import.meta.env.VITE_ANALYTICS_ID || '',
  errorTrackingDsn: import.meta.env.VITE_ERROR_TRACKING_DSN || ''
}

/**
 * Checks that env vars required for optional third-party integrations are
 * present. Never throws and never blocks app boot — Super Admin, Principal,
 * Teacher and public browsing all work with zero env vars set (mock mode).
 * Missing vars only disable the specific feature that needs them (contact
 * form, newsletter) — those features check `isFeatureConfigured()` and
 * degrade to a friendly inline message instead of a broken network call.
 */
export function validateEnv() {
  const missing = []

  if (!env.web3formsAccessKey) missing.push('VITE_WEB3FORMS_ACCESS_KEY (public Contact form will show a "temporarily unavailable" message)')
  if (!env.buttondownUsername) missing.push('VITE_BUTTONDOWN_USERNAME (Newsletter signup will show a "temporarily unavailable" message)')
  if (!env.useMock && !import.meta.env.VITE_API_BASE_URL) missing.push('VITE_API_BASE_URL (VITE_USE_MOCK=false but no backend URL is set — requests will hit relative /api)')

  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.warn(
      `[env] ${missing.length} optional environment variable(s) not set:\n` +
      missing.map((m) => `  - ${m}`).join('\n') +
      '\nSee .env.example for the full list and where to get each value.'
    )
  }

  return { valid: missing.length === 0, missing }
}

/** @param {'web3forms' | 'buttondown'} feature */
export function isFeatureConfigured(feature) {
  if (feature === 'web3forms') return !!env.web3formsAccessKey
  if (feature === 'buttondown') return !!env.buttondownUsername
  return true
}

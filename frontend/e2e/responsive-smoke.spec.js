import { test, expect } from '@playwright/test'

// Automatable slice of the "verify at every breakpoint" requirement: no
// unintended horizontal scroll on key pages at representative widths. This
// is not a substitute for a human visually reviewing the deployed site.
const VIEWPORTS = [
  { name: '375px (mobile)', width: 375, height: 800 },
  { name: '768px (tablet)', width: 768, height: 900 },
  { name: '1440px (desktop)', width: 1440, height: 900 }
]

const PAGES = ['/', '/categories', '/grades', '/programs', '/contact', '/search']

async function hasNoHorizontalOverflow(page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)
}

async function login(page, email, password) {
  await page.goto('/login')
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
}

test.describe('Responsive smoke — no horizontal overflow at key breakpoints', () => {
  for (const viewport of VIEWPORTS) {
    for (const path of PAGES) {
      test(`${path || 'home'} has no horizontal overflow at ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height })
        await page.goto(path, { waitUntil: 'networkidle' })
        expect(await hasNoHorizontalOverflow(page)).toBe(true)
      })
    }
  }

  test('the Super Admin login page has no horizontal overflow at 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 })
    await page.goto('/login', { waitUntil: 'networkidle' })
    expect(await hasNoHorizontalOverflow(page)).toBe(true)
  })
})

test.describe('Responsive smoke — authenticated portal pages at 375px', () => {
  const PORTAL_PAGES = [
    { role: 'Super Admin', email: 'admin@yntrasparks.com', paths: ['/admin', '/admin/messages', '/admin/notifications', '/admin/profile'] },
    { role: 'Principal', email: 'principal@dps.edu.in', paths: ['/principal', '/principal/teachers', '/principal/saved', '/principal/notifications'] },
    { role: 'Teacher', email: 'teacher@dps.edu.in', paths: ['/teacher', '/teacher/saved', '/teacher/notifications'] }
  ]

  for (const { role, email, paths } of PORTAL_PAGES) {
    for (const path of paths) {
      test(`${role} — ${path} has no horizontal overflow at 375px`, async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 800 })
        await login(page, email, 'demo1234')
        await page.waitForURL((url) => !url.pathname.includes('/login'))
        // Client-side push, not page.goto() — a hard reload would wipe the
        // in-memory mock session (see the __router dev hook in main.js).
        await page.evaluate((target) => window.__router.push(target), path)
        await page.waitForLoadState('networkidle')
        expect(await hasNoHorizontalOverflow(page)).toBe(true)
        // The top-right avatar trigger (UserMenu) must always be reachable,
        // including on mobile — that was the concrete bug this pass fixed.
        // Two instances exist in the DOM (desktop + mobile headers), each
        // hidden/shown by a `hidden md:flex` / `md:hidden` breakpoint class —
        // exactly one should be actually visible at this viewport width.
        await expect(page.locator('button[aria-label="Account menu"]:visible')).toHaveCount(1)
      })
    }
  }
})

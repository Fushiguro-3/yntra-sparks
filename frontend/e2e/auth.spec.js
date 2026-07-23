import { test, expect } from '@playwright/test'

// All against mock mode (VITE_USE_MOCK defaults true — see frontend/.env.example).
// Login now lands each role on its own Dashboard page (/admin, /principal,
// /teacher) rather than redirecting straight to a list view.
const USERS = {
  superAdmin: { email: 'admin@yntrasparks.com', password: 'demo1234', home: '/admin' },
  principal: { email: 'principal@dps.edu.in', password: 'demo1234', home: '/principal' },
  teacher: { email: 'teacher@dps.edu.in', password: 'demo1234', home: '/teacher' }
}

async function login(page, email, password) {
  await page.goto('/login')
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
}

test.describe('Login → role-based landing', () => {
  for (const [role, user] of Object.entries(USERS)) {
    test(`${role} lands on their own dashboard and can log out`, async ({ page }) => {
      await login(page, user.email, user.password)
      await expect(page).toHaveURL(new RegExp(user.home.replace('/', '\\/')))
      await expect(page.getByText('Demo Mode')).toBeVisible()

      // Logout lives inside the top-right Account menu now, not as a
      // directly-visible button — see PortalShell/UserMenu consolidation.
      await page.locator('button[aria-label="Account menu"]:visible').click()
      await page.getByRole('menuitem', { name: /log out/i }).click()
      await expect(page).toHaveURL(/\/login$/)
    })
  }

  test('shows an error on invalid credentials without navigating away', async ({ page }) => {
    await login(page, 'nobody@example.com', 'wrongpass')
    await expect(page.getByText('Invalid email or password')).toBeVisible()
    await expect(page).toHaveURL(/\/login$/)
  })

  test('a Teacher hitting a Super Admin route gets an explicit 403, not a blank page or silent redirect', async ({ page }) => {
    await login(page, USERS.teacher.email, USERS.teacher.password)
    // Client-side push, not page.goto() — a hard reload would wipe the
    // in-memory mock session (see the __router dev hook in main.js).
    await page.evaluate(() => window.__router.push('/admin/schools'))
    await expect(page.getByRole('heading', { name: /403/ })).toBeVisible()
  })

  test('an unauthenticated visitor hitting a protected route is sent to /login with a redirect target', async ({ page }) => {
    await page.goto('/principal/teachers')
    await expect(page).toHaveURL(/\/login\?redirect=/)
  })
})

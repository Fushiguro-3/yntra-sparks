import { test, expect } from '@playwright/test'

test('a freshly created account is forced through password change before reaching its dashboard', async ({ page }) => {
  await page.goto('/login')
  await page.locator('input[type="email"]').fill('newteacher@dps.edu.in')
  await page.locator('input[type="password"]').fill('temp1234')
  await page.getByRole('button', { name: /sign in/i }).click()

  await expect(page).toHaveURL(/\/change-password$/)
  await expect(page.getByText('Set a new password')).toBeVisible()

  // Manually navigating to the dashboard mid-flow must bounce back here.
  // Client-side push, not page.goto() — a hard reload would wipe the
  // in-memory mock session (see the __router dev hook in main.js).
  await page.evaluate(() => window.__router.push('/teacher/kits'))
  await expect(page).toHaveURL(/\/change-password$/)

  await page.locator('#current-password').fill('temp1234')
  await page.locator('#new-password').fill('newpass123')
  await page.locator('#confirm-password').fill('newpass123')
  await page.getByRole('button', { name: /update password/i }).click()

  await expect(page.getByText('Password updated')).toBeVisible()
  await expect(page).toHaveURL(/\/teacher$/, { timeout: 5000 })

  // Visiting /change-password again afterwards should bounce away — the
  // flag is cleared, there's nothing left to force.
  await page.evaluate(() => window.__router.push('/change-password'))
  await expect(page).toHaveURL(/\/teacher$/)
})

test('rejects the wrong current (temporary) password with an inline error', async ({ page }) => {
  await page.goto('/login')
  await page.locator('input[type="email"]').fill('newteacher@dps.edu.in')
  await page.locator('input[type="password"]').fill('temp1234')
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/change-password$/)

  await page.locator('#current-password').fill('not-the-right-password')
  await page.locator('#new-password').fill('newpass123')
  await page.locator('#confirm-password').fill('newpass123')
  await page.getByRole('button', { name: /update password/i }).click()

  await expect(page.getByText('Current password is incorrect')).toBeVisible()
  await expect(page).toHaveURL(/\/change-password$/)
})

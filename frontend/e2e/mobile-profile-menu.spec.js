import { test, expect } from '@playwright/test'

test('Mobile: the top-right account menu opens, navigates, and logs out at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 })
  await page.goto('/login')
  await page.locator('input[type="email"]').fill('teacher@dps.edu.in')
  await page.locator('input[type="password"]').fill('demo1234')
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/teacher$/)

  // Exactly one visible Account menu trigger at this width (mobile instance).
  const trigger = page.locator('button[aria-label="Account menu"]:visible')
  await expect(trigger).toHaveCount(1)
  await trigger.click()

  await expect(page.getByRole('menuitem', { name: 'My Profile' })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'Change Password' })).toBeVisible()
  await expect(page.getByRole('menuitem', { name: 'Notifications' })).toBeVisible()

  await page.getByRole('menuitem', { name: 'My Profile' }).click()
  await expect(page).toHaveURL(/\/teacher\/profile$/)

  // The hamburger drawer is pure navigation — no duplicated Logout/Profile there.
  await page.locator('button[aria-label="Open menu"]').click()
  const drawer = page.locator('[role="dialog"][aria-label="Teacher navigation"]')
  await expect(drawer).toBeVisible()
  await expect(drawer).not.toContainText('Log out')
  await page.locator('button[aria-label="Close menu"]').click()

  // Logout works from the mobile account menu too.
  await trigger.click()
  await page.getByRole('menuitem', { name: 'Log out' }).click()
  await expect(page).toHaveURL(/\/login$/)
})

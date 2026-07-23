import { test, expect } from '@playwright/test'

test('Super Admin: login → dashboard → messages → mark read → archive → profile edit → logout', async ({ page }) => {
  await page.goto('/login')
  await page.locator('input[type="email"]').fill('admin@yntrasparks.com')
  await page.locator('input[type="password"]').fill('demo1234')
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole('heading', { name: 'Command centre' })).toBeVisible()

  // Dashboard → Messages via the top-right user menu (the primary account menu).
  await page.locator('button[aria-label="Account menu"]:visible').click()
  await page.getByRole('menuitem', { name: 'Dashboard' }).click()
  await expect(page).toHaveURL(/\/admin$/)

  await page.evaluate(() => window.__router.push({ name: 'admin-messages' }))
  await expect(page.getByRole('heading', { name: 'Contact Messages' })).toBeVisible()

  // Mark the first message read, then archive it — it should disappear from Inbox.
  const firstRow = page.locator('tbody tr').first()
  await expect(firstRow.getByRole('button', { name: 'Archive' })).toBeVisible()
  const name = await firstRow.locator('td').first().innerText()
  const markReadButton = firstRow.getByRole('button', { name: 'Mark read' })
  if (await markReadButton.count()) {
    await markReadButton.click()
  }
  await firstRow.getByRole('button', { name: 'Archive' }).click()
  await expect(page.locator('tbody')).not.toContainText(name.replace(/^●?\s*/, ''))

  // Archived tab should now show it.
  await page.getByRole('tab', { name: /Archived/ }).click()
  await expect(page.locator('tbody')).toContainText(name.trim().replace(/^●\s*/, ''))

  // Profile edit.
  await page.locator('button[aria-label="Account menu"]:visible').click()
  await page.getByRole('menuitem', { name: 'My Profile' }).click()
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible()
  await page.getByRole('button', { name: 'Edit' }).click()
  await page.locator('#profile-name').fill('Command Centre Admin')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByRole('main').getByText('Command Centre Admin').first()).toBeVisible()

  // Logout from the top-right menu.
  await page.locator('button[aria-label="Account menu"]:visible').click()
  await page.getByRole('menuitem', { name: 'Log out' }).click()
  await expect(page).toHaveURL(/\/login$/)
})

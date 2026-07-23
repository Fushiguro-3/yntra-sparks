import { test, expect } from '@playwright/test'

test('Teacher: browse kit → save kit → recently viewed → profile edit → logout', async ({ page }) => {
  await page.goto('/login')
  await page.locator('input[type="email"]').fill('teacher@dps.edu.in')
  await page.locator('input[type="password"]').fill('demo1234')
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/teacher$/)

  await page.evaluate(() => window.__router.push({ name: 'teacher-kits' }))
  const firstCard = page.locator('article').first()
  const kitTitle = await firstCard.locator('h3').innerText()

  // Save the kit directly from the card.
  await firstCard.getByRole('button', { name: 'Save kit' }).click()
  await expect(firstCard.getByRole('button', { name: 'Remove from saved kits' })).toBeVisible()

  // Open the kit detail page (records "recently viewed"). Target the h1
  // specifically — the kits-list card also has an h3 with the same title,
  // so a role-only heading query can match the outgoing page transiently.
  await firstCard.locator('a').first().click()
  await expect(page).toHaveURL(/\/teacher\/kits\/\d+$/)
  await expect(page.locator('h1', { hasText: kitTitle })).toBeVisible()

  // Saved Kits page shows it.
  await page.evaluate(() => window.__router.push({ name: 'teacher-saved-kits' }))
  await expect(page.getByText(kitTitle)).toBeVisible()

  // Dashboard shows it under "Recently viewed kits".
  await page.evaluate(() => window.__router.push({ name: 'teacher-dashboard' }))
  await expect(page.getByText('Recently viewed kits')).toBeVisible()
  await expect(page.locator('main')).toContainText(kitTitle)

  // Profile edit.
  await page.locator('button[aria-label="Account menu"]:visible').click()
  await page.getByRole('menuitem', { name: 'My Profile' }).click()
  await page.getByRole('button', { name: 'Edit' }).click()
  await page.locator('#profile-name').fill('Priya S.')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByRole('main').getByText('Priya S.').first()).toBeVisible()

  await page.locator('button[aria-label="Account menu"]:visible').click()
  await page.getByRole('menuitem', { name: 'Log out' }).click()
  await expect(page).toHaveURL(/\/login$/)
})

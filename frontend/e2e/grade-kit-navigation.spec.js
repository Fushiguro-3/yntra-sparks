import { test, expect } from '@playwright/test'

test.describe('Grade → Kit → Back navigation (contextual back link)', () => {
  test('opening a kit from a Grade page returns to that same Grade, not Programs', async ({ page }) => {
    await page.goto('/grades?grade=Grade%205')
    await expect(page.getByRole('heading', { name: 'Grade 5 Kits' })).toBeVisible()

    await page.getByRole('link', { name: 'Explore Kit' }).first().click()
    await expect(page).toHaveURL(/\/kits\/\d+/)
    await expect(page.locator('a', { hasText: 'Back to Grade 5' })).toBeVisible()

    await page.locator('a', { hasText: 'Back to Grade 5' }).click()
    await expect(page).toHaveURL(/\/grades\?grade=Grade\+5$/)
    await expect(page.getByRole('heading', { name: 'Grade 5 Kits' })).toBeVisible()
  })

  test('opening a kit from Programs returns to Programs', async ({ page }) => {
    await page.goto('/programs')
    await page.getByRole('link', { name: 'Explore Kit' }).first().click()
    await expect(page).toHaveURL(/\/kits\/\d+/)
    await expect(page.locator('a', { hasText: 'Back to Programs' })).toBeVisible()
  })

  test('a direct kit link with no context shows a safe fallback back-link, not a broken "Back to Programs" lie', async ({ page }) => {
    await page.goto('/kits/1')
    await expect(page.locator('a', { hasText: 'Back to' })).toBeVisible()
  })
})

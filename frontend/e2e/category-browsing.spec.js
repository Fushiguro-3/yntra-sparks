import { test, expect } from '@playwright/test'

test.describe('Category browsing (public site)', () => {
  test('a category card navigates to a shareable, filtered category view, and each kit links to its detail page', async ({ page }) => {
    await page.goto('/categories')
    await expect(page.getByRole('heading', { name: 'Explore by Category' })).toBeVisible()

    await page.locator('a', { hasText: 'Robotics' }).first().click()
    await expect(page).toHaveURL(/\/categories\?category=2$/)
    await expect(page.getByRole('heading', { name: 'Robotics', level: 1 })).toBeVisible()
    await expect(page.locator('h3', { hasText: 'Intro to Robotics' })).toBeVisible()

    // Refresh-safe: reloading the same URL should show the same filtered view, not reset to the grid.
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Robotics', level: 1 })).toBeVisible()

    await page.getByRole('link', { name: 'Explore Kit' }).first().click()
    await expect(page).toHaveURL(/\/kits\/\d+/)
    await expect(page.locator('a', { hasText: 'Back to Robotics' })).toBeVisible()

    await page.locator('a', { hasText: 'Back to Robotics' }).click()
    await expect(page).toHaveURL(/\/categories\?category=2$/)
  })

  test('an unknown category id shows a clear not-found state with a way back, never a blank page', async ({ page }) => {
    await page.goto('/categories?category=999999')
    await expect(page.getByText('Category not found')).toBeVisible()

    await page.getByRole('button', { name: 'Back to Categories' }).click()
    await expect(page).toHaveURL(/\/categories$/)
    await expect(page.getByRole('heading', { name: 'Explore by Category' })).toBeVisible()
  })
})

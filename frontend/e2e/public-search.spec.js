import { test, expect } from '@playwright/test'

test.describe('Public advanced search', () => {
  test('keyword search, filters, URL persistence, refresh, and Search → Kit → Back', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Search kits' }).click()
    await expect(page).toHaveURL(/\/search$/)

    await page.locator('#search-q').fill('circuit')
    await expect(page).toHaveURL(/[?&]q=circuit/)
    await expect(page.locator('h3', { hasText: 'Circuit' })).toBeVisible()

    // Refresh preserves the query and results.
    await page.reload({ waitUntil: 'networkidle' })
    await expect(page.locator('#search-q')).toHaveValue('circuit')
    await expect(page.locator('h3', { hasText: 'Circuit' })).toBeVisible()

    // Search → Kit → Back restores the same search.
    await page.getByRole('link', { name: 'Explore Kit' }).first().click()
    await expect(page).toHaveURL(/\/kits\/\d+/)
    await page.locator('a', { hasText: 'Back to Search' }).click()
    await expect(page).toHaveURL(/[?&]q=circuit/)

    // Clear filters resets to the unfiltered catalog.
    await page.getByRole('button', { name: 'Clear filters' }).click()
    await expect(page).toHaveURL(/\/search$/)
    await expect(page.locator('#search-q')).toHaveValue('')
  })

  test('an empty result set shows a clear empty state', async ({ page }) => {
    await page.goto('/search?q=zzz_no_such_kit_zzz')
    await expect(page.getByText('No kits match your search.')).toBeVisible()
  })

  test('an unrecognized sort query param is ignored safely, defaulting to relevance', async ({ page }) => {
    await page.goto('/search?sort=not-a-real-sort')
    await expect(page.locator('#search-sort')).toHaveValue('relevance')
  })
})

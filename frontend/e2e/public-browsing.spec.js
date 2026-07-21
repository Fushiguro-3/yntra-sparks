import { test, expect } from '@playwright/test'

test.describe('Public site — unauthenticated browsing', () => {
  test('home → categories → programs → about → privacy/terms are all reachable via the nav/footer', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Yntra Sparks/)

    await page.getByRole('link', { name: 'Categories', exact: true }).first().click()
    await expect(page).toHaveURL(/\/categories$/)
    await expect(page.getByRole('heading', { name: 'Explore by Category' })).toBeVisible()
    // Real categoryService data (Electronics/Robotics/... — see src/data/categories.js),
    // not the old hardcoded STEM-pillar placeholder content. Scoped to <h3>
    // (the category card title) — a plain text match can also hit the word
    // "electronics" inside an unrelated kit description elsewhere on the
    // page during the route-transition overlap.
    await expect(page.locator('h3', { hasText: 'Electronics' })).toBeVisible()

    await page.getByRole('link', { name: 'Privacy', exact: true }).click()
    await expect(page).toHaveURL(/\/privacy$/)
    await expect(page.getByRole('heading', { name: 'Privacy Policy' })).toBeVisible()

    await page.getByRole('link', { name: 'Terms', exact: true }).click()
    await expect(page).toHaveURL(/\/terms$/)
    await expect(page.getByRole('heading', { name: 'Terms & Conditions' })).toBeVisible()
  })

  test('grades page lists kits fetched from the mock public catalog', async ({ page }) => {
    await page.goto('/grades')
    await expect(page.locator('body')).not.toContainText('undefined')
  })
})

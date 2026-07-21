import { test, expect } from '@playwright/test'

async function scrollDownAndConfirm(page, y) {
  await expect.poll(async () => {
    await page.evaluate((target) => window.scrollTo(0, target), y)
    return page.evaluate(() => window.scrollY)
  }, { timeout: 3000 }).toBeGreaterThan(y - 50)
}

// Playwright's locator.click() scrolls its target into view as part of its
// actionability checks before dispatching the event — for a link that's
// already visible (e.g. inside the sticky header, always on-screen), that
// auto-scroll still resets window.scrollY to wherever scrollIntoView()
// considers "natural" immediately before the click, which clobbers the
// exact scroll position we just set up to test restoration against. A real
// user click never does this. Dispatching the click via page.evaluate()
// bypasses Playwright's actionability/auto-scroll machinery entirely, so
// the scroll position at click time is genuinely what the test set up.
function clickViaDom(page, selector) {
  return page.evaluate((sel) => document.querySelector(sel).click(), selector)
}

test.describe('Scroll restoration (router/index.js scrollBehavior)', () => {
  test('Home → About → Back restores the scroll position on Home', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await scrollDownAndConfirm(page, 1200)

    await clickViaDom(page, 'nav[aria-label="Primary"] a[href="/about"]')
    await expect(page).toHaveURL(/\/about$/)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50)

    await page.goBack()
    await expect(page).toHaveURL(/\/$/)
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 3000 }).toBeGreaterThan(900)
  })

  test('a genuinely new navigation (not Back/Forward) starts at the top', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await scrollDownAndConfirm(page, 1200)

    await clickViaDom(page, 'nav[aria-label="Primary"] a[href="/categories"]')
    await expect(page).toHaveURL(/\/categories$/)
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50)
  })

  test('Forward navigation after Back also restores correctly', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' })
    await scrollDownAndConfirm(page, 1200)

    await clickViaDom(page, 'nav[aria-label="Primary"] a[href="/programs"]')
    await expect(page).toHaveURL(/\/programs$/)
    await scrollDownAndConfirm(page, 400)

    await page.goBack()
    await expect(page).toHaveURL(/\/$/)
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 3000 }).toBeGreaterThan(900)

    await page.goForward()
    await expect(page).toHaveURL(/\/programs$/)
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 3000 }).toBeGreaterThan(300)
  })
})

import { test, expect } from '@playwright/test'

test('submitting the Contact form succeeds and can be re-submitted after "Send another message"', async ({ page }) => {
  // Never hit the real Web3Forms API from an automated test run.
  await page.route('https://api.web3forms.com/submit', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  )

  await page.goto('/contact')
  await page.locator('#contact-name').fill('Playwright Tester')
  await page.locator('#contact-email').fill('tester@example.com')
  await page.locator('#contact-subject').fill('Smoke test')
  await page.locator('#contact-message').fill('This is an automated end-to-end test message.')
  await page.getByRole('button', { name: 'Send Message' }).click()

  await expect(page.getByText("Thanks, we'll be in touch.")).toBeVisible()

  await page.getByRole('button', { name: /send another message/i }).click()
  await expect(page.locator('#contact-name')).toHaveValue('')
})

test('shows field-level validation errors on an empty submit without calling Web3Forms', async ({ page }) => {
  let called = false
  await page.route('https://api.web3forms.com/submit', (route) => {
    called = true
    route.fulfill({ status: 200, body: '{"success":true}' })
  })

  await page.goto('/contact')
  await page.getByRole('button', { name: 'Send Message' }).click()

  await expect(page.getByText('Please enter your name.')).toBeVisible()
  expect(called).toBe(false)
})

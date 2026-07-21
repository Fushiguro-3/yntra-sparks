import { test, expect } from '@playwright/test'

// This repo's local frontend/.env intentionally ships with
// VITE_BUTTONDOWN_USERNAME unset (see the "Newsletter" section of the
// final report / .env.example) — no Buttondown account exists yet. So the
// honest, currently-true smoke test is that the footer degrades to a
// friendly message instead of a broken/silent form. The full "configured
// and subscribing" flow (loading/success/already-subscribed/error states,
// with the network call mocked) is already covered end-to-end by
// tests/component/NewsletterForm.spec.js — once a real
// VITE_BUTTONDOWN_USERNAME is set, this test's expectation flips to
// asserting the form renders instead, per the comment below.
test('newsletter signup degrades gracefully in the footer when Buttondown is not yet configured', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Newsletter signup is temporarily unavailable.')).toBeVisible()
})

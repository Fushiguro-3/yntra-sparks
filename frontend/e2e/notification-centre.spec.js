import { test, expect } from '@playwright/test'

test('Notification centre: an admin action generates a notification, the bell badges it, and it can be read/dismissed', async ({ page }) => {
  await page.goto('/login')
  await page.locator('input[type="email"]').fill('admin@yntrasparks.com')
  await page.locator('input[type="password"]').fill('demo1234')
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/admin$/)

  // Creating a school is one of the concrete points that generates a notification.
  await page.evaluate(() => window.__router.push({ name: 'admin-schools' }))
  await page.getByRole('button', { name: '+ Add School' }).click()
  const schoolName = `E2E School ${Date.now()}`
  await page.locator('#school-name').fill(schoolName)
  await page.locator('#school-email').fill(`e2e-${Date.now()}@school.com`)
  await page.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByText(schoolName)).toBeVisible()

  // The creation success toast shares the top-right corner with the bell
  // dropdown — dismiss it so it can't intercept clicks meant for the dropdown.
  const toast = page.getByRole('status').first()
  if (await toast.count()) {
    await toast.getByRole('button', { name: 'Dismiss notification' }).click()
    await expect(page.getByRole('status')).toHaveCount(0)
  }

  // Bell shows an unread badge.
  const bell = page.locator('button[aria-label="Notifications"]:visible')
  await expect(bell).toBeVisible()
  await expect(bell).toContainText('1')

  await bell.click()
  const notificationItem = page.getByRole('link', { name: /School created/ })
  await expect(notificationItem).toBeVisible()
  await notificationItem.click()

  // Clicking the notification navigated to Schools and marked it read — badge clears.
  await expect(page).toHaveURL(/\/admin\/schools$/)
  await expect(bell).not.toContainText('1')

  // Full Notifications page shows it too, and can dismiss it.
  await page.evaluate(() => window.__router.push({ name: 'admin-notifications' }))
  await expect(page.getByText('School created')).toBeVisible()
  await page.getByRole('main').getByRole('button', { name: /Dismiss notification/ }).first().click()
})

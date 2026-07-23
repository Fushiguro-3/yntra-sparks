import { test, expect } from '@playwright/test'

test('Principal: invite teacher → resend → revoke → profile edit → logout', async ({ page }) => {
  await page.goto('/login')
  await page.locator('input[type="email"]').fill('principal@dps.edu.in')
  await page.locator('input[type="password"]').fill('demo1234')
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/principal$/)

  await page.evaluate(() => window.__router.push({ name: 'principal-teachers' }))
  await page.getByRole('tab', { name: /Invitations/ }).click()

  await page.getByRole('button', { name: '+ Invite Teacher' }).click()
  const email = `e2e-invite-${Date.now()}@dps.edu.in`
  await page.locator('#invite-name').fill('E2E Invited Teacher')
  await page.locator('#invite-email').fill(email)
  await page.getByRole('button', { name: 'Send Invitation' }).click()
  await expect(page.locator('tbody')).toContainText('E2E Invited Teacher')
  await expect(page.locator('tbody')).toContainText('pending')

  const row = page.locator('tr', { hasText: 'E2E Invited Teacher' })
  await row.getByRole('button', { name: 'Resend' }).click()
  await expect(page.locator('tbody')).toContainText('pending')

  await row.getByRole('button', { name: 'Revoke' }).click()
  await page.getByRole('dialog', { name: 'Revoke invitation?' }).getByRole('button', { name: 'Revoke' }).click()
  await expect(row).toContainText('revoked')

  // Profile edit.
  await page.locator('button[aria-label="Account menu"]:visible').click()
  await page.getByRole('menuitem', { name: 'My Profile' }).click()
  await page.getByRole('button', { name: 'Edit' }).click()
  await page.locator('#profile-name').fill('DPS Principal')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByRole('main').getByText('DPS Principal').first()).toBeVisible()

  await page.locator('button[aria-label="Account menu"]:visible').click()
  await page.getByRole('menuitem', { name: 'Log out' }).click()
  await expect(page).toHaveURL(/\/login$/)
})

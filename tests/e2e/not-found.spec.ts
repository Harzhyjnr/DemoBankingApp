import { expect, test } from '@playwright/test'
import { loginAsDemo } from './auth-helper'

test('unknown routes render the 404 page inside the shell', async ({ page }) => {
  await loginAsDemo(page)
  await page.goto('/definitely-not-a-page')

  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
  await expect(page.getByText('/definitely-not-a-page')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()

  await page.getByRole('link', { name: /back to dashboard/i }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible()
})

test('signed-out users on an unknown route are asked to sign in', async ({ page }) => {
  await page.goto('/definitely-not-a-page')

  await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
  await expect(page.getByText('Welcome back')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeHidden()
})

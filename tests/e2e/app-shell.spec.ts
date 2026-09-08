import { expect, test } from '@playwright/test'
import { loginAsDemo } from './auth-helper'

test('app shell loads with the placeholder dashboard after login', async ({ page }) => {
  await loginAsDemo(page)
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible()
})

test('mobile viewport shows the drawer navigation', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 })
  await loginAsDemo(page)

  // Desktop sidebar is hidden on mobile.
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeHidden()

  // Open the drawer via the hamburger.
  await page.getByRole('button', { name: 'Open menu' }).click()
  const drawerNav = page.getByRole('navigation', { name: 'Primary mobile' })
  await expect(drawerNav).toBeVisible()

  // Navigating via the drawer works and closes it.
  await drawerNav.getByRole('link', { name: 'UI Gallery' }).click()
  await expect(page.getByRole('heading', { name: 'UI Gallery', exact: true })).toBeVisible()
  await expect(drawerNav).toBeHidden()
})

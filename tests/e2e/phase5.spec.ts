import { expect, test } from '@playwright/test'
import { loginAsDemo } from './auth-helper'

async function primaryNav(page: import('@playwright/test').Page) {
  return page.getByRole('navigation', { name: 'Primary' })
}

test('freezing a card is optimistic and persists across SPA navigation', async ({ page }) => {
  await loginAsDemo(page)

  await (await primaryNav(page)).getByRole('link', { name: 'Cards' }).click()
  await expect(page.getByRole('heading', { name: 'Cards' })).toBeVisible()

  const freezeButton = page.getByRole('button', { name: 'Freeze Everyday Visa' })
  await expect(freezeButton).toBeVisible()
  await freezeButton.click()

  // Optimistic UI flips immediately to a re-activate action.
  const reactivateButton = page.getByRole('button', { name: 'Re-activate Everyday Visa' })
  await expect(reactivateButton).toBeVisible()
  await expect(page.getByText('Payments with this card are paused.')).toBeVisible()

  // Leave and return via SPA so the in-memory mock DB is preserved.
  await (await primaryNav(page)).getByRole('link', { name: 'Dashboard' }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible()
  await (await primaryNav(page)).getByRole('link', { name: 'Cards' }).click()
  await expect(page.getByRole('heading', { name: 'Cards' })).toBeVisible()

  await expect(page.getByRole('button', { name: 'Re-activate Everyday Visa' })).toBeVisible({
    timeout: 15_000,
  })
  await page.getByRole('button', { name: 'Re-activate Everyday Visa' }).click()
  await expect(page.getByRole('button', { name: 'Freeze Everyday Visa' })).toBeVisible()
})

test('insights respond to the period selector', async ({ page }) => {
  await loginAsDemo(page)

  await (await primaryNav(page)).getByRole('link', { name: 'Insights' }).click()
  await expect(page.getByRole('heading', { name: 'Insights' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Monthly spend' })).toBeVisible({
    timeout: 15_000,
  })

  const total = page.getByTestId('period-total')
  await expect(total).toBeVisible()
  const twelveMonthTotal = await total.innerText()
  expect(twelveMonthTotal).toMatch(/₦/)

  await page.getByRole('group', { name: 'Time period' }).getByRole('button', { name: '3M' }).click()

  await expect
    .poll(async () => page.getByText('Spent in the last 3 months').isVisible(), {
      timeout: 10_000,
    })
    .toBe(true)
  await expect(await total.innerText()).toBeTruthy()
  expect(await total.innerText()).not.toBe(twelveMonthTotal)

  // Category breakdown and top merchants render from the API.
  await expect(page.getByRole('heading', { name: 'By category' })).toBeVisible()
  const firstRank = page.getByRole('list').getByText(/\d{2}/).first()
  await expect(firstRank).toBeVisible()
  await expect(page.getByRole('progressbar').first()).toBeVisible()
})

test('profile edits reflect app-wide and notification prefs persist', async ({ page }) => {
  await loginAsDemo(page)

  await (await primaryNav(page)).getByRole('link', { name: 'Settings' }).click()
  await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()

  const firstName = page.getByLabel('First name')
  await firstName.fill('')
  await firstName.fill('E2E')
  await page.getByRole('button', { name: 'Save profile' }).click()
  await expect(page.getByText('Profile updated.')).toBeVisible({ timeout: 15_000 })

  // The updated profile propagates to the sidebar via the auth store.
  await (await primaryNav(page)).getByRole('link', { name: 'Dashboard' }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible()
  await expect(page.getByText("E2E's wallet")).toBeVisible()

  // Notifications: toggle promos on, save, and confirm persistence on return.
  await (await primaryNav(page)).getByRole('link', { name: 'Settings' }).click()
  await page.getByRole('tab', { name: 'Notifications' }).click()

  const promos = page.getByRole('checkbox', { name: 'Product updates & promotions' })
  await expect(promos).toBeVisible()
  await promos.check()
  await page.getByRole('button', { name: 'Save preferences' }).click()
  await expect(page.getByText('Notification preferences updated.')).toBeVisible({
    timeout: 15_000,
  })

  await (await primaryNav(page)).getByRole('link', { name: 'Settings' }).click()
  await page.getByRole('tab', { name: 'Notifications' }).click()
  await expect(promos).toBeChecked({ timeout: 15_000 })
})

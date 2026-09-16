import { expect, test } from '@playwright/test'
import { loginAsDemo } from './auth-helper'

function parseNaira(text: string): number {
  return Number(text.replace(/[^\d.-]/g, ''))
}

async function checkingBalanceText(page: import('@playwright/test').Page): Promise<string> {
  const card = page.locator('a[href="/accounts/acc_checking"]')
  return card.getByTestId('money').innerText()
}

async function completeTransfer(page: import('@playwright/test').Page, amount: string, note = '') {
  await page.getByRole('combobox', { name: 'Source account' }).click()
  await page.getByRole('option', { name: /Naija Everyday/ }).click()

  await page.getByRole('combobox', { name: 'Destination account' }).click()
  await page.getByRole('option', { name: /Spend Account/ }).click()

  await page.getByLabel('Amount').fill(amount)
  if (note) await page.getByLabel('Note (optional)').fill(note)
  await page.getByRole('button', { name: 'Review transfer' }).click()
  await expect(page.getByRole('heading', { name: 'Review transfer' })).toBeVisible()

  await page.getByLabel('Confirm with your 4-digit PIN').fill('1234')
  await page.getByRole('button', { name: 'Confirm transfer' }).click()
}

test('transfer flow moves money and reduces the source balance', async ({ page }) => {
  await loginAsDemo(page)

  const beforeText = await checkingBalanceText(page)
  const before = parseNaira(beforeText)

  await page.getByRole('link', { name: 'New transfer' }).click()
  await completeTransfer(page, '100')

  await expect(page.getByRole('heading', { name: 'Transfer complete' })).toBeVisible({
    timeout: 15_000,
  })

  // Navigate back with SPA routing so the in-memory mock DB isn't reloaded.
  await page
    .getByRole('navigation', { name: 'Primary' })
    .getByRole('link', { name: 'Dashboard' })
    .click()
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible()

  const balanceLocator = page.locator('a[href="/accounts/acc_checking"]').getByTestId('money')
  await expect(balanceLocator).not.toHaveText(beforeText, { timeout: 15_000 })
  const after = parseNaira(await balanceLocator.innerText())
  expect(after).toBe(before - 100)
})

test('new transfer appears as a transfer row in the activity list', async ({ page }) => {
  await loginAsDemo(page)
  await page.getByRole('link', { name: 'New transfer' }).click()

  const note = `E2E transfer ${Date.now()}`
  await completeTransfer(page, '50', note)
  await expect(page.getByRole('heading', { name: 'Transfer complete' })).toBeVisible({
    timeout: 15_000,
  })

  // SPA navigation to the Activity page, then search for the unique note.
  await page
    .getByRole('navigation', { name: 'Primary' })
    .getByRole('link', { name: 'Activity' })
    .click()
  await expect(page.getByRole('heading', { name: 'Transactions', exact: true })).toBeVisible()

  await page.getByLabel('Search transactions').fill(note)

  const row = page.getByRole('row', { name: new RegExp(note) }).first()
  await expect(row).toBeVisible({ timeout: 15_000 })
  await expect(row).toContainText('Naija Everyday')
  await expect(row).toContainText('transfer')
  await expect(row).toContainText('₦50.00')
})

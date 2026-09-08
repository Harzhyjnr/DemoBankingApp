import { expect, type Page } from '@playwright/test'

export async function loginAsDemo(page: Page) {
  await page.goto('/login')
  await page.getByLabel('Email').fill('demo@bank.com')
  await page.getByLabel('Password', { exact: true }).fill('demo1234')
  await page.getByLabel('Remember me').check()
  await page.getByRole('button', { name: 'Sign in' }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible()
}

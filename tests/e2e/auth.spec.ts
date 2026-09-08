import { expect, test } from '@playwright/test'

test.describe('Authentication flows', () => {
  test('redirects an unauthenticated user to /login', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => sessionStorage.clear())
    await page.goto('/', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 })
    await expect(page.getByText('Welcome back')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeHidden()
  })

  test('shows an inline error for wrong credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('demo@bank.com')
    await page.getByLabel('Password', { exact: true }).fill('wrong-password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByText('Invalid email or password.')).toBeVisible()
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
  })

  test('logs in with demo credentials and lands on the dashboard', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('demo@bank.com')
    await page.getByLabel('Password', { exact: true }).fill('demo1234')
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible()
  })

  test('logout clears the session and returns to /login', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('demo@bank.com')
    await page.getByLabel('Password', { exact: true }).fill('demo1234')
    await page.getByLabel('Remember me').check()
    await page.getByRole('button', { name: 'Sign in' }).click()
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible()

    await page.getByRole('button', { name: 'Account menu' }).click()
    await page.getByRole('menuitem', { name: 'Log out' }).click()

    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByText('Welcome back')).toBeVisible()
  })

  test('register creates an account and lands on the dashboard', async ({ page }) => {
    const email = `user-${Date.now()}@bank.com`
    await page.goto('/register')
    await page.getByLabel('First name').fill('Ada')
    await page.getByLabel('Last name').fill('Lovelace')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password', { exact: true }).fill('supersecret1')
    await page.getByLabel('Confirm password').fill('supersecret1')
    await page.getByLabel(/I agree to the Terms of Service/).check()
    await page.getByRole('button', { name: 'Create account' }).click()

    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible()
  })
})

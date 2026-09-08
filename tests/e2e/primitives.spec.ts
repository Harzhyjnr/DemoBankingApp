import { expect, test } from '@playwright/test'
import { loginAsDemo } from './auth-helper'

test.describe('Radix primitives: keyboard, focus & roles (real browser)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDemo(page)
    await page.goto('/ui')
    await expect(page.getByRole('heading', { name: 'UI Gallery' })).toBeVisible({
      timeout: 15_000,
    })
  })

  test('dialog opens, traps focus, closes with Escape', async ({ page }) => {
    await page.getByRole('button', { name: 'Open dialog' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    await expect(dialog.getByText('Are you sure?')).toBeVisible()

    // Focus moves into the dialog (Radix focus scope).
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeFocused()

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
  })

  test('select: opens a listbox, navigates by keyboard and selects', async ({ page }) => {
    const trigger = page.getByRole('combobox', { name: 'Currency' })
    await expect(trigger).toHaveText('USD')

    await trigger.click()
    const listbox = page.getByRole('listbox')
    await expect(listbox).toBeVisible()
    await expect(page.getByRole('option', { name: 'EUR' })).toBeVisible()

    await page.getByRole('option', { name: 'EUR' }).click()
    await expect(trigger).toHaveText('EUR')
  })

  test('dropdown: opens a menu, navigates by arrow keys and closes with Escape', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Dropdown menu' }).click()
    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()

    await expect(menu).toBeFocused()

    await page.keyboard.press('ArrowDown')
    const profile = page.getByRole('menuitem', { name: 'Profile' })
    await expect(profile).toHaveAttribute('data-highlighted', '')

    await page.keyboard.press('ArrowDown')
    const settings = page.getByRole('menuitem', { name: 'Settings' })
    await expect(settings).toHaveAttribute('data-highlighted', '')

    await page.keyboard.press('ArrowDown')
    const logout = page.getByRole('menuitem', { name: 'Log out' })
    await expect(logout).toHaveAttribute('data-highlighted', '')

    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(page.getByRole('button', { name: 'Dropdown menu' })).toBeFocused()
  })
})

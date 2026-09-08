import { expect, test } from '@playwright/test'

test.describe('Radix primitives: keyboard, focus & roles (real browser)', () => {
  test.beforeEach(async ({ page }) => {
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

    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(trigger).toHaveText('EUR')
  })

  test('dropdown: opens a menu, navigates by arrow keys and closes with Escape', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'Dropdown menu' }).click()
    const menu = page.getByRole('menu')
    await expect(menu).toBeVisible()

    await expect(menu).toBeFocused()
    const profile = page.getByRole('menuitem', { name: 'Profile' })
    await page.keyboard.press('ArrowDown')
    await expect(profile).toHaveAttribute('data-highlighted', '')
    await expect(profile).toBeFocused()
    await expect(page.getByRole('menuitem', { name: 'Settings' })).toHaveAttribute(
      'data-highlighted',
      '',
    )
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('menuitem', { name: 'Log out' })).toHaveAttribute(
      'data-highlighted',
      '',
    )
    await page.keyboard.press('Escape')
    await expect(menu).toBeHidden()
    await expect(page.getByRole('button', { name: 'Dropdown menu' })).toBeFocused()
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { axe, toHaveNoViolations } from 'jest-axe'

import { NotificationsForm } from '@/features/settings/components/NotificationsForm'
import { queryClient } from '@/app/queryClient'
import { db } from '@/mocks/db'
import { saveToken } from '@/lib/auth/token'

expect.extend(toHaveNoViolations)

const toastMock = vi.fn()

vi.mock('sonner', () => ({
  toast: (...args: unknown[]) => toastMock(...args),
}))

function renderForm() {
  return render(
    <QueryClientProvider client={queryClient}>
      <NotificationsForm />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  queryClient.clear()
  saveToken(db.issueToken('usr_demo'))
})

describe('NotificationsForm', () => {
  it('loads the default preferences', async () => {
    renderForm()

    expect(await screen.findByRole('checkbox', { name: 'Transfer alerts' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Security alerts' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Product updates & promotions' })).not.toBeChecked()
  })

  it('keeps the save button disabled until a preference changes', async () => {
    renderForm()

    const save = await screen.findByRole('button', { name: 'Save preferences' })
    expect(save).toBeDisabled()
  })

  it('persists a changed preference and shows a confirmation', async () => {
    const user = userEvent.setup()
    renderForm()

    const promotions = await screen.findByRole('checkbox', { name: 'Product updates & promotions' })
    expect(promotions).not.toBeChecked()
    await user.click(promotions)

    expect(screen.getByRole('button', { name: 'Save preferences' })).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Save preferences' }))

    await waitFor(() => expect(toastMock).toHaveBeenCalledWith('Notification preferences updated.'))
    expect(db.getNotificationPreferences('usr_demo').promotions).toBe(true)
  })

  it('has no accessibility violations', async () => {
    const { container } = renderForm()
    await screen.findByText('Transfer alerts')
    expect(await axe(container)).toHaveNoViolations()
  })
})

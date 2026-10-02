import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { axe, toHaveNoViolations } from 'jest-axe'

import { SecurityForm } from '@/features/settings/components/SecurityForm'
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
      <SecurityForm />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  queryClient.clear()
  saveToken(db.issueToken('usr_demo'))
})

describe('SecurityForm', () => {
  it('renders the PIN form, 2FA row and sessions', () => {
    renderForm()

    expect(screen.getByLabelText('Current PIN')).toBeInTheDocument()
    expect(screen.getByLabelText('New PIN')).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm new PIN')).toBeInTheDocument()
    expect(screen.getByText('Two-factor authentication')).toBeInTheDocument()
    expect(screen.getByText('Chrome on Windows')).toBeInTheDocument()
  })

  it('validates that PINs are 4 digits and match', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText('Current PIN'), '12')
    await user.type(screen.getByLabelText('New PIN'), '1234')
    await user.type(screen.getByLabelText('Confirm new PIN'), '9999')
    await user.click(screen.getByRole('button', { name: 'Change PIN' }))

    expect(screen.getByText('Current PIN must be 4 digits.')).toBeInTheDocument()
    expect(screen.getByText('PINs do not match.')).toBeInTheDocument()
  })

  it('submits valid PINs', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(screen.getByLabelText('Current PIN'), '1234')
    await user.type(screen.getByLabelText('New PIN'), '4321')
    await user.type(screen.getByLabelText('Confirm new PIN'), '4321')
    await user.click(screen.getByRole('button', { name: 'Change PIN' }))

    await waitFor(() => expect(toastMock).toHaveBeenCalledWith('Security settings updated.'))
  })

  it('toggles two-factor authentication', async () => {
    const user = userEvent.setup()
    renderForm()

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
    await user.click(checkbox)
    expect(screen.getByText('Disabled')).toBeInTheDocument()
  })

  it('revokes a session', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: 'Revoke Firefox on macOS' }))

    expect(screen.queryByText('Firefox on macOS')).not.toBeInTheDocument()
    expect(screen.getByText('Chrome on Windows')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = renderForm()
    expect(await axe(container)).toHaveNoViolations()
  })
})

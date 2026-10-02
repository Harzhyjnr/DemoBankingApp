import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { axe, toHaveNoViolations } from 'jest-axe'

import SettingsPage from '@/features/settings/pages/SettingsPage'
import { queryClient } from '@/app/queryClient'
import { db } from '@/mocks/db'
import { saveToken } from '@/lib/auth/token'
import { useAuthStore } from '@/lib/auth/authStore'
import type { User } from '@/lib/api/types'

expect.extend(toHaveNoViolations)

const DEMO_USER: User = {
  id: 'usr_demo',
  firstName: 'Demo',
  lastName: 'User',
  email: 'demo@bank.com',
  preferredCurrency: 'NGN',
}

function renderPage() {
  useAuthStore.setState({ user: DEMO_USER, token: null, status: 'authenticated' })
  return render(
    <QueryClientProvider client={queryClient}>
      <SettingsPage />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  queryClient.clear()
  saveToken(db.issueToken('usr_demo'))
})

describe('SettingsPage', () => {
  it('renders the heading and tabs', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Profile' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Security' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Notifications' })).toBeInTheDocument()
  })

  it('switches between tabs by keyboard', async () => {
    const user = userEvent.setup()
    renderPage()

    const profileTab = screen.getByRole('tab', { name: 'Profile' })
    const securityTab = screen.getByRole('tab', { name: 'Security' })
    expect(profileTab).toHaveAttribute('data-state', 'active')

    profileTab.focus()
    await user.keyboard('{ArrowRight}')

    expect(securityTab).toHaveAttribute('data-state', 'active')
    expect(screen.getByText('Two-factor authentication')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = renderPage()
    expect(await axe(container)).toHaveNoViolations()
  })
})

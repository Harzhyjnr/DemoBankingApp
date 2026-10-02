import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Children, isValidElement, type ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { axe, toHaveNoViolations } from 'jest-axe'

import { ProfileForm } from '@/features/settings/components/ProfileForm'
import { queryClient } from '@/app/queryClient'
import { db } from '@/mocks/db'
import { saveToken } from '@/lib/auth/token'
import { useAuthStore } from '@/lib/auth/authStore'
import type { User } from '@/lib/api/types'

expect.extend(toHaveNoViolations)

vi.mock('@/components/ui/select', () => {
  function findTriggerProps(children: unknown): Record<string, unknown> | null {
    for (const child of Children.toArray(children as ReactNode)) {
      if (isValidElement<{ 'aria-label'?: unknown; id?: unknown; children?: unknown }>(child)) {
        const props = child.props
        if (props['aria-label'] || props.id) return props
        const nested = findTriggerProps(props.children)
        if (nested) return nested
      }
    }
    return null
  }

  const Select = ({
    value,
    onValueChange,
    children,
  }: {
    value?: string
    onValueChange: (value: string) => void
    children: ReactNode
  }) => {
    const triggerProps = findTriggerProps(children) ?? {}
    return (
      <select
        data-testid="mock-select"
        value={value ?? ''}
        onChange={(event) => onValueChange(event.target.value)}
        aria-label={(triggerProps['aria-label'] as string) ?? undefined}
        id={(triggerProps.id as string) ?? undefined}
      >
        {children}
      </select>
    )
  }

  const SelectTrigger = ({ children }: { children: ReactNode }) => <>{children}</>
  const SelectValue = () => null
  const SelectContent = ({ children }: { children: ReactNode }) => <>{children}</>
  const SelectItem = ({ value, children }: { value: string; children: ReactNode }) => (
    <option value={value}>{children}</option>
  )

  return { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
})

const DEMO_USER: User = {
  id: 'usr_demo',
  firstName: 'Demo',
  lastName: 'User',
  email: 'demo@bank.com',
  preferredCurrency: 'NGN',
}

function renderForm() {
  useAuthStore.setState({ user: DEMO_USER, token: null, status: 'authenticated' })
  return render(
    <QueryClientProvider client={queryClient}>
      <ProfileForm />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  queryClient.clear()
  saveToken(db.issueToken('usr_demo'))
})

afterEach(() => {
  document.documentElement.classList.remove('dark')
  window.localStorage.removeItem('theme')
})

describe('ProfileForm', () => {
  it('renders the form prefilled from the profile', () => {
    renderForm()

    expect(screen.getByLabelText('First name')).toHaveValue('Demo')
    expect(screen.getByLabelText('Last name')).toHaveValue('User')
    expect(screen.getByLabelText('Preferred currency')).toHaveValue('NGN')
    expect(screen.getByRole('button', { name: 'Save profile' })).toBeInTheDocument()
  })

  it('rejects an empty submit with inline errors', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.clear(screen.getByLabelText('First name'))
    await user.clear(screen.getByLabelText('Last name'))
    await user.click(screen.getByRole('button', { name: 'Save profile' }))

    expect(screen.getByText('First name is required.')).toBeInTheDocument()
    expect(screen.getByText('Last name is required.')).toBeInTheDocument()
  })

  it('saves the profile and updates the auth store user', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.clear(screen.getByLabelText('First name'))
    await user.type(screen.getByLabelText('First name'), 'Ada')
    await user.clear(screen.getByLabelText('Last name'))
    await user.type(screen.getByLabelText('Last name'), 'Lovelace')
    await user.selectOptions(screen.getByLabelText('Preferred currency'), 'USD')

    expect(screen.getByText('Save profile')).toBeEnabled()
    await user.click(screen.getByRole('button', { name: 'Save profile' }))

    const saved = useAuthStore.getState().user
    expect(saved?.firstName).toBe('Ada')
    expect(saved?.lastName).toBe('Lovelace')
    expect(saved?.preferredCurrency).toBe('USD')
  })

  it('switches the theme and persists it', async () => {
    const user = userEvent.setup()
    renderForm()

    expect(screen.getByRole('button', { name: 'light' })).toHaveAttribute('aria-pressed', 'true')
    await user.click(screen.getByRole('button', { name: 'dark' }))

    expect(screen.getByRole('button', { name: 'dark' })).toHaveAttribute('aria-pressed', 'true')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(window.localStorage.getItem('theme')).toBe('dark')
  })

  it('has no accessibility violations', async () => {
    const { container } = renderForm()
    expect(await axe(container)).toHaveNoViolations()
  })
})

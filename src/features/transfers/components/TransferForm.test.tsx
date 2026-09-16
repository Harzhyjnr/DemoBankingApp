import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Children, isValidElement, type ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { axe, toHaveNoViolations } from 'jest-axe'
import { TransferForm } from '@/features/transfers/components/TransferForm'
import { queryClient } from '@/app/queryClient'
import { db } from '@/mocks/db'
import { saveToken } from '@/lib/auth/token'
import { formatMoney } from '@/lib/money'

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

function renderForm(props: { defaultFromAccountId?: string } = {}) {
  return render(
    <QueryClientProvider client={queryClient}>
      <TransferForm {...props} />
    </QueryClientProvider>,
  )
}

function selectSource(id: string) {
  fireEvent.change(screen.getByRole('combobox', { name: 'Source account' }), {
    target: { value: id },
  })
}

function selectDestination(id: string) {
  fireEvent.change(screen.getByRole('combobox', { name: 'Destination account' }), {
    target: { value: id },
  })
}

function enterAmount(value: string) {
  fireEvent.change(screen.getByLabelText('Amount'), { target: { value } })
}

function enterPin(value: string) {
  fireEvent.change(screen.getByLabelText('Confirm with your 4-digit PIN'), { target: { value } })
}

beforeEach(() => {
  queryClient.clear()
  saveToken(db.issueToken('usr_demo'))
})

async function renderReady(props: { defaultFromAccountId?: string } = {}) {
  renderForm(props)
  await screen.findByRole('combobox', { name: 'Source account' })
  await screen.findAllByRole('option')
  return userEvent.setup()
}

async function clickReview(user: ReturnType<typeof userEvent.setup>) {
  const button = await screen.findByRole('button', { name: /Review transfer/ })
  await user.click(button)
}

describe('TransferForm', () => {
  it('has no accessibility violations on the initial step', async () => {
    const { container } = renderForm()
    await screen.findByRole('combobox', { name: 'Source account' })
    expect(await axe(container)).toHaveNoViolations()
  })

  it('shows validation errors when required fields are empty', async () => {
    const user = await renderReady()
    await clickReview(user)

    expect(await screen.findByText('Select a source account.')).toBeInTheDocument()
    expect(screen.getByText('Select a destination account.')).toBeInTheDocument()
    expect(screen.getByText('Enter an amount greater than zero.')).toBeInTheDocument()
  })

  it('rejects a destination equal to the source account', async () => {
    const user = await renderReady()

    selectSource('acc_checking')
    selectDestination('acc_checking')
    enterAmount('50')
    await clickReview(user)

    expect(
      await screen.findByText('Destination must be different from the source account.'),
    ).toBeInTheDocument()
  })

  it('rejects an amount that exceeds the source balance', async () => {
    const user = await renderReady()

    const checking = db.getAccountForUser('usr_demo', 'acc_checking')!
    selectSource('acc_checking')
    selectDestination('acc_spending')
    enterAmount((checking.balance.amount / 100 + 1000).toFixed(2))
    await clickReview(user)

    expect(
      await screen.findByText('Amount exceeds the available balance of the source account.'),
    ).toBeInTheDocument()
  })

  it('rejects zero and sanitizes negative input', async () => {
    const user = await renderReady()

    selectSource('acc_checking')
    selectDestination('acc_spending')
    enterAmount('0')
    await clickReview(user)
    expect(await screen.findByText('Enter an amount greater than zero.')).toBeInTheDocument()

    enterAmount('-50')
    expect(screen.getByLabelText('Amount')).toHaveValue('50')
    await clickReview(user)
    expect(await screen.findByText('Review transfer')).toBeInTheDocument()
  })

  it('completes a transfer and shows the success screen', async () => {
    const user = await renderReady()

    const checking = db.getAccountForUser('usr_demo', 'acc_checking')!
    selectSource('acc_checking')
    selectDestination('acc_spending')
    enterAmount('100')
    await clickReview(user)

    expect(await screen.findByText('Review transfer')).toBeInTheDocument()
    const fromName = db.getAccountForUser('usr_demo', 'acc_checking')!.name
    const toName = db.getAccountForUser('usr_demo', 'acc_spending')!.name
    expect(screen.getByText(fromName)).toBeInTheDocument()
    expect(screen.getByText(toName)).toBeInTheDocument()
    expect(
      screen.getByText(formatMoney(100_00, { currency: checking.currency })),
    ).toBeInTheDocument()

    enterPin('1234')
    await user.click(screen.getByRole('button', { name: /Confirm transfer/ }))

    expect(await screen.findByText('Transfer complete')).toBeInTheDocument()
  })

  it('shows recent recipients and transfers on the success screen', async () => {
    const user = await renderReady()

    selectSource('acc_checking')
    selectDestination('acc_spending')
    enterAmount('100')
    await clickReview(user)
    enterPin('1234')
    await user.click(screen.getByRole('button', { name: /Confirm transfer/ }))

    expect(await screen.findByText('Transfer complete')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Recent recipients' })).toBeInTheDocument()
    expect(
      screen.getAllByRole('button', { name: /Naija Everyday|Spend Account/ }).length,
    ).toBeGreaterThan(0)
    expect(screen.getByRole('heading', { name: 'Recent transfers' })).toBeInTheDocument()
  })

  it('requires a 4-digit PIN before confirming', async () => {
    const user = await renderReady()

    selectSource('acc_checking')
    selectDestination('acc_spending')
    enterAmount('50')
    await clickReview(user)

    await user.click(screen.getByRole('button', { name: /Confirm transfer/ }))
    expect(await screen.findByText('Enter your 4-digit PIN.')).toBeInTheDocument()
  })

  it('surfaces an incorrect PIN error from the server', async () => {
    const user = await renderReady()

    selectSource('acc_checking')
    selectDestination('acc_spending')
    enterAmount('50')
    await clickReview(user)

    enterPin('9999')
    await user.click(screen.getByRole('button', { name: /Confirm transfer/ }))

    expect(await screen.findByText('Incorrect PIN. Please try again.')).toBeInTheDocument()
  })

  it('lets insufficient funds error be corrected', async () => {
    const user = await renderReady()

    const checking = db.getAccountForUser('usr_demo', 'acc_checking')!
    selectSource('acc_checking')
    selectDestination('acc_spending')
    enterAmount((checking.balance.amount / 100 + 1000).toFixed(2))
    await clickReview(user)

    expect(
      await screen.findByText('Amount exceeds the available balance of the source account.'),
    ).toBeInTheDocument()

    enterAmount('100')
    await clickReview(user)
    enterPin('1234')
    await user.click(screen.getByRole('button', { name: /Confirm transfer/ }))

    expect(await screen.findByText('Transfer complete')).toBeInTheDocument()
  })
})

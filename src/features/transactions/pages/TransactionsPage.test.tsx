import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import TransactionsPage from '@/features/transactions/pages/TransactionsPage'
import { queryClient } from '@/app/queryClient'
import { db } from '@/mocks/db'
import { saveToken } from '@/lib/auth/token'

const PAGE_SIZE = 25

function renderPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TransactionsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function openTrigger(el: HTMLElement) {
  fireEvent.pointerDown(el, { pointerId: 1, pointerType: 'mouse', button: 0 })
  fireEvent.mouseDown(el, { button: 0 })
  fireEvent.pointerUp(el, { pointerId: 1, pointerType: 'mouse', button: 0 })
  fireEvent.mouseUp(el, { button: 0 })
  fireEvent.click(el)
}

async function bodyRows(): Promise<HTMLElement[]> {
  const table = await screen.findByRole('table')
  const rows = within(table).getAllByRole('row')
  return rows.slice(1)
}

async function waitForResults(expectedTotal: number) {
  await screen.findByText(new RegExp(`\\(${expectedTotal} results\\)`))
}

beforeEach(() => {
  queryClient.clear()
  saveToken(db.issueToken('usr_demo'))
})

describe('TransactionsPage', () => {
  it('renders the heading and all filter controls', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Transactions' })).toBeInTheDocument()
    expect(screen.getByLabelText('Search transactions')).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Filter by category' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Filter by type' })).toBeInTheDocument()
    expect(screen.getByLabelText('From')).toBeInTheDocument()
    expect(screen.getByLabelText('To')).toBeInTheDocument()
  })

  it('loads the first page of transactions', async () => {
    renderPage()

    const expectedPage1 = db.getAllTransactions('usr_demo', { page: 1, limit: PAGE_SIZE }).items
    await waitForResults(db.getAllTransactions('usr_demo', { page: 1, limit: PAGE_SIZE }).total)
    const rows = await bodyRows()
    expect(rows).toHaveLength(expectedPage1.length)
    expect(screen.getByText(/Showing page 1 of/)).toBeInTheDocument()
  })

  it('paginates to the next page', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitForResults(db.getAllTransactions('usr_demo', { page: 1 }).total)

    await user.click(screen.getByRole('button', { name: 'Next page' }))

    const expectedPage2 = db.getAllTransactions('usr_demo', { page: 2, limit: PAGE_SIZE }).items
    expect(await screen.findByText(/Showing page 2 of/)).toBeInTheDocument()
    const rows = await bodyRows()
    expect(rows).toHaveLength(expectedPage2.length)
    expect(within(rows[0]).getAllByRole('cell')[2]).toHaveTextContent(expectedPage2[0].description)
  })

  it('filters by type', async () => {
    renderPage()
    await waitForResults(db.getAllTransactions('usr_demo', { page: 1 }).total)

    openTrigger(screen.getByRole('combobox', { name: 'Filter by type' }))
    fireEvent.click(await screen.findByRole('option', { name: 'transfer' }))

    const expected = db
      .getAllTransactions('usr_demo', { type: 'transfer', page: 1, limit: PAGE_SIZE })
      .items.map((txn) => txn.type)
    await waitForResults(
      db.getAllTransactions('usr_demo', { type: 'transfer', page: 1, limit: PAGE_SIZE }).total,
    )
    for (const row of await bodyRows()) {
      const cells = within(row).getAllByRole('cell')
      expect(cells[4]).toHaveTextContent('transfer')
    }
    expect(expected.length).toBeGreaterThan(0)
  })

  it('filters by category', async () => {
    renderPage()
    await waitForResults(db.getAllTransactions('usr_demo', { page: 1 }).total)

    openTrigger(screen.getByRole('combobox', { name: 'Filter by category' }))
    fireEvent.click(await screen.findByRole('option', { name: 'Rent' }))

    await waitForResults(
      db.getAllTransactions('usr_demo', { category: 'Rent', page: 1, limit: PAGE_SIZE }).total,
    )
    for (const row of await bodyRows()) {
      const cells = within(row).getAllByRole('cell')
      expect(cells[3]).toHaveTextContent('Rent')
    }
  })

  it('searches by query text', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitForResults(db.getAllTransactions('usr_demo', { page: 1 }).total)

    await user.type(screen.getByLabelText('Search transactions'), 'Landlord')

    await waitForResults(
      db.getAllTransactions('usr_demo', { q: 'Landlord', page: 1, limit: PAGE_SIZE }).total,
    )
    for (const row of await bodyRows()) {
      const cells = within(row).getAllByRole('cell')
      expect(cells[2]).toHaveTextContent('Landlord')
    }
  })

  it('combines filters and shows an empty state when nothing matches', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitForResults(db.getAllTransactions('usr_demo', { page: 1 }).total)

    openTrigger(screen.getByRole('combobox', { name: 'Filter by type' }))
    fireEvent.click(await screen.findByRole('option', { name: 'credit' }))
    await waitForResults(
      db.getAllTransactions('usr_demo', { type: 'credit', page: 1, limit: PAGE_SIZE }).total,
    )

    await user.type(screen.getByLabelText('Search transactions'), 'Landlord')
    expect(await screen.findByText('No transactions found')).toBeInTheDocument()
  })

  it('resets filters back to the full list', async () => {
    const user = userEvent.setup()
    renderPage()
    await waitForResults(db.getAllTransactions('usr_demo', { page: 1 }).total)

    await user.type(screen.getByLabelText('Search transactions'), 'zzz-no-match')
    expect(await screen.findByText('No transactions found')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Reset filters' }))
    await waitForResults(db.getAllTransactions('usr_demo', { page: 1 }).total)
    expect(screen.queryByText('No transactions found')).not.toBeInTheDocument()
  })
})

import { beforeEach, describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
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
  await screen.findByText(new RegExp(`\\(${expectedTotal} results\\)`), undefined, {
    timeout: 5000,
  })
}

describe('scratch b', () => {
  beforeEach(() => {
    queryClient.clear()
    saveToken(db.issueToken('usr_demo'))
  })

  it('copy of filters-by-type', async () => {
    renderPage()
    await waitForResults(db.getAllTransactions('usr_demo', { page: 1 }).total)

    openTrigger(screen.getByRole('combobox', { name: 'Filter by type' }))
    fireEvent.click(
      await screen.findByRole('option', { name: 'transfer' }, undefined, { timeout: 5000 }),
    )

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
})

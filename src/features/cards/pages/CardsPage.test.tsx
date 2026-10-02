import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { axe, toHaveNoViolations } from 'jest-axe'
import { http, HttpResponse } from 'msw'

import CardsPage from '@/features/cards/pages/CardsPage'
import { queryClient } from '@/app/queryClient'
import { db } from '@/mocks/db'
import { server } from '@/mocks/server'
import { saveToken } from '@/lib/auth/token'

expect.extend(toHaveNoViolations)

function renderPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <CardsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  queryClient.clear()
  saveToken(db.issueToken('usr_demo'))
})

describe('CardsPage', () => {
  it('renders the heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Cards' })).toBeInTheDocument()
  })

  it('loads the seeded cards with freeze actions', async () => {
    renderPage()

    expect(await screen.findByText('Everyday Visa')).toBeInTheDocument()
    expect(screen.getByText('Everyday Mastercard')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Freeze Everyday Visa' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Freeze Everyday Mastercard' })).toBeInTheDocument()
  })

  it('freezes a card optimistically and persists the change', async () => {
    const user = userEvent.setup()
    renderPage()

    const freezeButton = await screen.findByRole('button', { name: 'Freeze Everyday Visa' })
    await user.click(freezeButton)

    expect(screen.getByRole('button', { name: 'Re-activate Everyday Visa' })).toBeInTheDocument()
    await screen.findByText('Payments with this card are paused.')

    const card = db.getCardForUser('usr_demo', 'card_visa')
    expect(card?.status).toBe('frozen')
  })

  it('re-activates a frozen card', async () => {
    const user = userEvent.setup()
    renderPage()

    const freezeButton = await screen.findByRole('button', { name: 'Freeze Everyday Mastercard' })
    await user.click(freezeButton)
    const reactivateButton = await screen.findByRole('button', {
      name: 'Re-activate Everyday Mastercard',
    })
    await user.click(reactivateButton)

    await screen.findByRole('button', { name: 'Freeze Everyday Mastercard' })
    const card = db.getCardForUser('usr_demo', 'card_mc')
    expect(card?.status).toBe('active')
  })

  it('has no accessibility violations', async () => {
    const { container } = renderPage()
    await screen.findByText('Everyday Visa')
    expect(await axe(container)).toHaveNoViolations()
  })

  it('shows an error state with a retry action when the fetch fails', async () => {
    server.use(
      http.get('*/api/cards', () => {
        return HttpResponse.error()
      }),
    )

    renderPage()

    expect(
      await screen.findByText("We couldn't load your cards", undefined, { timeout: 5_000 }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})

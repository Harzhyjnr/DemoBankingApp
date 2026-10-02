import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { axe, toHaveNoViolations } from 'jest-axe'

import NotFoundPage from '@/app/pages/NotFoundPage'

expect.extend(toHaveNoViolations)

function LocationProbe() {
  const { pathname } = useLocation()
  return <p>Landed on {pathname}</p>
}

function renderPage(initialEntries: string[]) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<LocationProbe />} />
        <Route path="/transactions" element={<LocationProbe />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('NotFoundPage', () => {
  it('explains the missing route with the attempted path', () => {
    renderPage(['/definitely-not-a-page'])

    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('/definitely-not-a-page')).toBeInTheDocument()
  })

  it('sends the user back to the dashboard', async () => {
    const user = userEvent.setup()
    renderPage(['/nope'])

    await user.click(screen.getByRole('link', { name: /back to dashboard/i }))

    expect(screen.getByText('Landed on /')).toBeInTheDocument()
  })

  it('links to the activity page', async () => {
    const user = userEvent.setup()
    renderPage(['/nope'])

    await user.click(screen.getByRole('link', { name: /view activity/i }))

    expect(screen.getByText('Landed on /transactions')).toBeInTheDocument()
  })

  it('goes back in history', async () => {
    const user = userEvent.setup()
    renderPage(['/', '/nope'])

    await user.click(screen.getByRole('button', { name: /go back/i }))

    expect(screen.getByText('Landed on /')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = renderPage(['/nope'])
    expect(await axe(container)).toHaveNoViolations()
  })
})

import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { axe, toHaveNoViolations } from 'jest-axe'
import { http, HttpResponse } from 'msw'

import InsightsPage from '@/features/insights/pages/InsightsPage'
import { queryClient } from '@/app/queryClient'
import { db } from '@/mocks/db'
import { server } from '@/mocks/server'
import { saveToken } from '@/lib/auth/token'
import { formatMoney } from '@/lib/money'
import { sliceMonthly, totalSpend } from '@/features/insights/lib/aggregate'

expect.extend(toHaveNoViolations)

function renderPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <InsightsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function totalFor(months: number): string {
  const insights = db.getInsights('usr_demo')
  return formatMoney(totalSpend(sliceMonthly(insights.monthly, months)), {
    currency: insights.monthly[0]?.currency ?? 'NGN',
  })
}

beforeEach(() => {
  queryClient.clear()
  saveToken(db.issueToken('usr_demo'))
})

describe('InsightsPage', () => {
  it('renders the heading, period selector and sections', async () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Insights' })).toBeInTheDocument()
    expect(await screen.findByRole('group', { name: 'Time period' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3M' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '6M' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '12M' })).toBeInTheDocument()

    expect(await screen.findByRole('heading', { name: 'Monthly spend' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'By category' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Top merchants' })).toBeInTheDocument()
  })

  it('shows the total spend for the default 12-month period', async () => {
    renderPage()

    expect(await screen.findByText(totalFor(12))).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '12M' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('recomputes the total and chart when the period changes', async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findByText(totalFor(12))
    await user.click(screen.getByRole('button', { name: '3M' }))

    expect(screen.getByText('Spent in the last 3 months')).toBeInTheDocument()
    expect(screen.getByText(totalFor(3))).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3M' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('renders category breakdown and top merchants from the API', async () => {
    renderPage()

    const insights = db.getInsights('usr_demo')
    const topCategory = insights.byCategory[0]

    expect(
      await screen.findByRole('progressbar', { name: `${topCategory.category} share` }),
    ).toBeInTheDocument()
    expect(screen.getByText(insights.topMerchants[0].merchant)).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = renderPage()
    await screen.findByRole('heading', { name: 'Monthly spend' })
    expect(await axe(container)).toHaveNoViolations()
  })

  it('shows an error state with a retry action when the fetch fails', async () => {
    server.use(
      http.get('*/api/insights/spending', () => {
        return HttpResponse.error()
      }),
    )

    renderPage()

    expect(
      await screen.findByText("We couldn't load your spending insights", undefined, {
        timeout: 5_000,
      }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })
})

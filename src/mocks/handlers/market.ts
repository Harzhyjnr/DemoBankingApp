import { http, HttpResponse } from 'msw'
import { db } from '@/mocks/db'
import { market } from '@/mocks/db/crypto'
import { unauthorized } from '@/mocks/handlers/http'

export const marketHandlers = [
  http.get('*/api/market', ({ request }) => {
    const userId = db.requireAuth(request)
    if (!userId) return unauthorized()
    return HttpResponse.json({ prices: market.getPrices() })
  }),

  http.get('*/api/portfolio', ({ request }) => {
    const userId = db.requireAuth(request)
    if (!userId) return unauthorized()

    const accounts = db.getUserAccounts(userId)
    const cashMinor = accounts.reduce((sum, account) => sum + account.balance.amount, 0)
    const currency = accounts[0]?.currency ?? 'NGN'
    const holdings = market.getHoldings()

    return HttpResponse.json({
      summary: market.portfolioSummary(cashMinor, currency),
      holdings,
    })
  }),
]

import { http, HttpResponse } from 'msw'
import { db } from '@/mocks/db'
import { notFound, readPagination, unauthorized } from '@/mocks/handlers/http'

export const accountHandlers = [
  http.get('*/api/accounts', ({ request }) => {
    const userId = db.requireAuth(request)
    if (!userId) return unauthorized()
    return HttpResponse.json({ accounts: db.getUserAccounts(userId) })
  }),

  http.get('*/api/accounts/:id', ({ request, params }) => {
    const userId = db.requireAuth(request)
    if (!userId) return unauthorized()

    const account = db.getAccountForUser(userId, String(params.id))
    if (!account) return notFound('Account not found.')
    return HttpResponse.json({ account })
  }),

  http.get('*/api/accounts/:id/transactions', ({ request, params }) => {
    const userId = db.requireAuth(request)
    if (!userId) return unauthorized()

    const accountId = String(params.id)
    if (!db.getAccountForUser(userId, accountId)) {
      return notFound('Account not found.')
    }
    const page = readPagination(new URL(request.url))
    return HttpResponse.json(db.getAccountTransactions(userId, accountId, page))
  }),
]

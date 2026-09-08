import { http, HttpResponse } from 'msw'
import { db } from '@/mocks/db'
import { readPagination, unauthorized } from '@/mocks/handlers/http'

export const transactionHandlers = [
  http.get('*/api/transactions', ({ request }) => {
    const userId = db.requireAuth(request)
    if (!userId) return unauthorized()

    const page = readPagination(new URL(request.url))
    return HttpResponse.json(db.getAllTransactions(userId, page))
  }),
]

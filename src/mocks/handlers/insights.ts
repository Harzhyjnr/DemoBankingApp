import { http, HttpResponse } from 'msw'
import { db } from '@/mocks/db'
import { unauthorized } from '@/mocks/handlers/http'
import { apiPattern } from '@/lib/api/base'

export const insightHandlers = [
  http.get(apiPattern('/insights/spending'), ({ request }) => {
    const userId = db.requireAuth(request)
    if (!userId) return unauthorized()
    return HttpResponse.json(db.getInsights(userId))
  }),
]

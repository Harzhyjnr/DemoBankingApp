import { http, HttpResponse } from 'msw'
import { db } from '@/mocks/db'
import { unauthorized } from '@/mocks/handlers/http'

export const insightHandlers = [
  http.get('*/api/insights/spending', ({ request }) => {
    const userId = db.requireAuth(request)
    if (!userId) return unauthorized()
    return HttpResponse.json(db.getInsights(userId))
  }),
]

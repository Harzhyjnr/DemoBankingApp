import { http, HttpResponse } from 'msw'
import { db } from '@/mocks/db'
import { notFound, unauthorized } from '@/mocks/handlers/http'
import { apiPattern } from '@/lib/api/base'

export const cardHandlers = [
  http.get(apiPattern('/cards'), ({ request }) => {
    const userId = db.requireAuth(request)
    if (!userId) return unauthorized()
    return HttpResponse.json({ cards: db.getCardsForUser(userId) })
  }),

  http.post(apiPattern('/cards/:id/freeze'), ({ request, params }) => {
    const userId = db.requireAuth(request)
    if (!userId) return unauthorized()

    const cardId = String(params.id)
    if (!db.getCardForUser(userId, cardId)) return notFound('Card not found.')
    const card = db.setCardStatus(cardId, 'frozen')
    if (!card) return notFound('Card not found.')
    return HttpResponse.json({ card })
  }),

  http.post(apiPattern('/cards/:id/unfreeze'), ({ request, params }) => {
    const userId = db.requireAuth(request)
    if (!userId) return unauthorized()

    const cardId = String(params.id)
    if (!db.getCardForUser(userId, cardId)) return notFound('Card not found.')
    const card = db.setCardStatus(cardId, 'active')
    if (!card) return notFound('Card not found.')
    return HttpResponse.json({ card })
  }),
]

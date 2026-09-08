import { http, HttpResponse } from 'msw'
import { currentUser } from '@/mocks/data/me'

export const authHandlers = [
  http.get('*/api/me', () => {
    return HttpResponse.json({ user: currentUser })
  }),
]

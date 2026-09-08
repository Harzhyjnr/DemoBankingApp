import { http, HttpResponse } from 'msw'
import { db } from '@/mocks/db'
import { badRequest, unauthorized } from '@/mocks/handlers/http'
import type { Currency } from '@/lib/api/types'

interface ProfilePatchBody {
  firstName?: unknown
  lastName?: unknown
  preferredCurrency?: unknown
}

export const settingHandlers = [
  http.patch('*/api/settings/profile', async ({ request }) => {
    const userId = db.requireAuth(request)
    if (!userId) return unauthorized()

    let body: ProfilePatchBody = {}
    try {
      body = (await request.json()) as ProfilePatchBody
    } catch {
      return badRequest('INVALID_REQUEST', 'Malformed request body.')
    }

    const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : undefined
    const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : undefined
    const preferredCurrency =
      typeof body.preferredCurrency === 'string' ? (body.preferredCurrency as Currency) : undefined

    if (firstName === '') return badRequest('VALIDATION_ERROR', 'First name cannot be empty.')
    if (lastName === '') return badRequest('VALIDATION_ERROR', 'Last name cannot be empty.')
    if (preferredCurrency && !['USD', 'EUR', 'GBP'].includes(preferredCurrency)) {
      return badRequest('VALIDATION_ERROR', 'Unsupported currency.')
    }

    const user = db.updateProfile(userId, { firstName, lastName, preferredCurrency })
    if (!user) return unauthorized()
    return HttpResponse.json({ user })
  }),

  http.patch('*/api/settings/security', ({ request }) => {
    const userId = db.requireAuth(request)
    if (!userId) return unauthorized()
    return HttpResponse.json({ ok: true })
  }),
]

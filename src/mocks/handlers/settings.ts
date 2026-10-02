import { http, HttpResponse } from 'msw'
import { db } from '@/mocks/db'
import { badRequest, unauthorized } from '@/mocks/handlers/http'
import type { Currency, NotificationPreferences } from '@/lib/api/types'
import { apiPattern } from '@/lib/api/base'

interface ProfilePatchBody {
  firstName?: unknown
  lastName?: unknown
  preferredCurrency?: unknown
}

interface NotificationPrefsBody {
  transferAlerts?: unknown
  securityAlerts?: unknown
  promotions?: unknown
}

export const settingHandlers = [
  http.patch(apiPattern('/settings/profile'), async ({ request }) => {
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
    if (preferredCurrency && !['NGN', 'USD', 'EUR', 'GBP'].includes(preferredCurrency)) {
      return badRequest('VALIDATION_ERROR', 'Unsupported currency.')
    }

    const user = db.updateProfile(userId, { firstName, lastName, preferredCurrency })
    if (!user) return unauthorized()
    return HttpResponse.json({ user })
  }),

  http.patch(apiPattern('/settings/security'), ({ request }) => {
    const userId = db.requireAuth(request)
    if (!userId) return unauthorized()
    return HttpResponse.json({ ok: true })
  }),

  http.get(apiPattern('/settings/notifications'), ({ request }) => {
    const userId = db.requireAuth(request)
    if (!userId) return unauthorized()
    return HttpResponse.json(db.getNotificationPreferences(userId))
  }),

  http.patch(apiPattern('/settings/notifications'), async ({ request }) => {
    const userId = db.requireAuth(request)
    if (!userId) return unauthorized()

    let body: NotificationPrefsBody = {}
    try {
      body = (await request.json()) as NotificationPrefsBody
    } catch {
      return badRequest('INVALID_REQUEST', 'Malformed request body.')
    }

    const prefs: Partial<NotificationPreferences> = {
      transferAlerts: typeof body.transferAlerts === 'boolean' ? body.transferAlerts : undefined,
      securityAlerts: typeof body.securityAlerts === 'boolean' ? body.securityAlerts : undefined,
      promotions: typeof body.promotions === 'boolean' ? body.promotions : undefined,
    }

    const current = db.getNotificationPreferences(userId)
    const next = db.setNotificationPreferences(userId, {
      ...current,
      ...Object.fromEntries(
        Object.entries(prefs).filter(([, value]) => typeof value === 'boolean'),
      ),
    })
    return HttpResponse.json(next)
  }),
]

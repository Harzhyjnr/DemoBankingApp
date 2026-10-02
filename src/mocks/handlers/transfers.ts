import { http, HttpResponse } from 'msw'
import { db } from '@/mocks/db'
import { badRequest, notFound, unauthorized } from '@/mocks/handlers/http'
import type { Currency, Money } from '@/lib/api/types'
import { apiPattern } from '@/lib/api/base'

interface TransferBody {
  amount?: unknown
  fromAccountId?: unknown
  toAccountId?: unknown
  description?: unknown
  pin?: unknown
}

type ValidationResult = ReturnType<typeof badRequest> | null

function validatePin(body: TransferBody, request: Request): ValidationResult {
  if (typeof body.pin === 'string' && body.pin.trim()) {
    const userId = db.requireAuth(request)
    const record = userId ? db.findUserById(userId) : null
    if (!record || body.pin !== record.pin) {
      return badRequest('INVALID_PIN', 'Incorrect PIN. Please try again.')
    }
  }
  return null
}

export const transferHandlers = [
  http.get(apiPattern('/transfers/recent'), ({ request }) => {
    const userId = db.requireAuth(request)
    if (!userId) return unauthorized()
    return HttpResponse.json(db.getRecentTransfersResponse(userId))
  }),

  http.post(apiPattern('/transfers'), async ({ request }) => {
    const userId = db.requireAuth(request)
    if (!userId) return unauthorized()

    let body: TransferBody = {}
    try {
      body = (await request.json()) as TransferBody
    } catch {
      return badRequest('INVALID_REQUEST', 'Malformed request body.')
    }

    const pinError = validatePin(body, request)
    if (pinError) return pinError

    const amount = body.amount as Money | undefined
    const fromAccountId = typeof body.fromAccountId === 'string' ? body.fromAccountId : ''
    const toAccountId = typeof body.toAccountId === 'string' ? body.toAccountId : ''
    const description = typeof body.description === 'string' ? body.description.trim() : undefined

    if (!amount || typeof amount.amount !== 'number' || typeof amount.currency !== 'string') {
      return badRequest('INVALID_AMOUNT', 'A valid amount is required.')
    }
    if (!Number.isInteger(amount.amount) || amount.amount <= 0) {
      return badRequest('INVALID_AMOUNT', 'Amount must be a positive whole number of minor units.')
    }
    if (!fromAccountId || !toAccountId) {
      return badRequest('INVALID_ACCOUNT', 'Both source and destination accounts are required.')
    }
    if (fromAccountId === toAccountId) {
      return badRequest('INVALID_ACCOUNT', 'Source and destination accounts must be different.')
    }

    const fromAccount = db.getAccountForUser(userId, fromAccountId)
    const toAccount = db.getAccountForUser(userId, toAccountId)
    if (!fromAccount || !toAccount) {
      return notFound('One or more accounts not found.')
    }
    if (amount.currency !== fromAccount.currency || amount.currency !== toAccount.currency) {
      return badRequest('INVALID_AMOUNT', 'Transfer currency must match both accounts.')
    }
    if (fromAccount.balance.amount < amount.amount) {
      return badRequest('INSUFFICIENT_FUNDS', 'Insufficient funds for this transfer.')
    }

    const result = db.executeTransfer({
      fromAccountId,
      toAccountId,
      amount: amount.amount,
      currency: amount.currency as Currency,
      description,
    })

    return HttpResponse.json(result, { status: 201 })
  }),
]

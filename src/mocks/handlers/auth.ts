import { http, HttpResponse } from 'msw'
import { db } from '@/mocks/db'

interface LoginBody {
  email?: unknown
  password?: unknown
}

interface RegisterBody {
  firstName?: unknown
  lastName?: unknown
  email?: unknown
  password?: unknown
}

export const authHandlers = [
  http.post('*/api/auth/login', async ({ request }) => {
    let body: LoginBody = {}
    try {
      body = (await request.json()) as LoginBody
    } catch {
      return HttpResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'Malformed request body.' } },
        { status: 400 },
      )
    }

    const email = typeof body.email === 'string' ? body.email : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const record = db.findUserByEmail(email)

    if (!record || record.password !== password) {
      return HttpResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } },
        { status: 401 },
      )
    }

    return HttpResponse.json({ token: db.issueToken(record.id), user: db.toPublicUser(record) })
  }),

  http.post('*/api/auth/register', async ({ request }) => {
    let body: RegisterBody = {}
    try {
      body = (await request.json()) as RegisterBody
    } catch {
      return HttpResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'Malformed request body.' } },
        { status: 400 },
      )
    }

    const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : ''
    const lastName = typeof body.lastName === 'string' ? body.lastName.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!firstName || !lastName || !email || !password) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'All fields are required.' } },
        { status: 400 },
      )
    }

    const existing = db.findUserByEmail(email)
    if (existing) {
      return HttpResponse.json(
        { error: { code: 'EMAIL_TAKEN', message: 'An account with this email already exists.' } },
        { status: 409 },
      )
    }

    const record = db.createUser({ firstName, lastName, email, password })
    if (!record) {
      return HttpResponse.json(
        { error: { code: 'EMAIL_TAKEN', message: 'An account with this email already exists.' } },
        { status: 409 },
      )
    }

    return HttpResponse.json(
      { token: db.issueToken(record.id), user: db.toPublicUser(record) },
      { status: 201 },
    )
  }),

  http.post('*/api/auth/logout', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('*/api/me', ({ request }) => {
    const userId = db.requireAuth(request)
    if (!userId) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Your session has expired. Please sign in again.',
          },
        },
        { status: 401 },
      )
    }
    const record = db.findUserById(userId)
    if (!record) {
      return HttpResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Your session has expired. Please sign in again.',
          },
        },
        { status: 401 },
      )
    }
    return HttpResponse.json({ user: db.toPublicUser(record) })
  }),

  http.get('*/api/users/:id', ({ params }) => {
    const id = String(params.id)
    const record = db.findUserById(id)
    if (!record) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'User not found.' } },
        { status: 404 },
      )
    }
    return HttpResponse.json({ user: db.toPublicUser(record) })
  }),
]

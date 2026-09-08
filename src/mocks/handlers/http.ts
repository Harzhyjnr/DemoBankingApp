import { HttpResponse } from 'msw'
import type { PaginationParams } from '@/lib/api/types'

export function unauthorized() {
  return HttpResponse.json(
    { error: { code: 'UNAUTHORIZED', message: 'Your session has expired. Please sign in again.' } },
    { status: 401 },
  )
}

export function notFound(message = 'Resource not found.') {
  return HttpResponse.json({ error: { code: 'NOT_FOUND', message } }, { status: 404 })
}

export function badRequest(code: string, message: string, details?: unknown) {
  return HttpResponse.json({ error: { code, message, details } }, { status: 400 })
}

export function readPagination(url: URL): PaginationParams {
  const page = url.searchParams.get('page')
  const limit = url.searchParams.get('limit')
  const type = url.searchParams.get('type')
  return {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    category: url.searchParams.get('category') ?? undefined,
    type: type === 'debit' || type === 'credit' || type === 'transfer' ? type : undefined,
    from: url.searchParams.get('from') ?? undefined,
    to: url.searchParams.get('to') ?? undefined,
    q: url.searchParams.get('q') ?? undefined,
  }
}

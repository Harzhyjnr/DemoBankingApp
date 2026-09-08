const TOKEN_TTL_MS = 60 * 60 * 1000

export interface MockTokenPayload {
  sub: string
  iat: number
  exp: number
}

function encodeBase64(input: string): string {
  if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
    return Buffer.from(input, 'utf-8').toString('base64')
  }
  return btoa(input)
}

function decodeBase64(input: string): string {
  if (typeof Buffer !== 'undefined' && typeof Buffer.from === 'function') {
    return Buffer.from(input, 'base64').toString('utf-8')
  }
  return atob(input)
}

export function createToken(userId: string): string {
  const payload: MockTokenPayload = {
    sub: userId,
    iat: Date.now(),
    exp: Date.now() + TOKEN_TTL_MS,
  }
  return `mock.${encodeBase64(JSON.stringify(payload))}.sig`
}

export function decodeToken(token: string): MockTokenPayload | null {
  try {
    const [, encoded] = token.split('.')
    if (!encoded) return null
    const parsed = JSON.parse(decodeBase64(encoded)) as Partial<MockTokenPayload>
    if (typeof parsed.sub !== 'string' || typeof parsed.exp !== 'number') return null
    return parsed as MockTokenPayload
  } catch {
    return null
  }
}

export function isTokenActive(token: string): boolean {
  const payload = decodeToken(token)
  return payload !== null && payload.exp > Date.now()
}

export function activeTokenUserId(token: string): string | null {
  const payload = decodeToken(token)
  if (!payload || payload.exp <= Date.now()) return null
  return payload.sub
}

const TOKEN_STORAGE_KEY = 'banking.auth.token'

let memoryToken: string | null = null

export function getToken(): string | null {
  if (memoryToken) return memoryToken
  try {
    return window.sessionStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function saveToken(token: string | null, remember = false) {
  memoryToken = token
  try {
    if (token && remember) {
      window.sessionStorage.setItem(TOKEN_STORAGE_KEY, token)
    } else {
      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY)
    }
  } catch {
    // Ignore storage failures (e.g. private mode).
  }
}

export function clearToken() {
  memoryToken = null
  try {
    window.sessionStorage.removeItem(TOKEN_STORAGE_KEY)
  } catch {
    // Ignore storage failures (e.g. private mode).
  }
}

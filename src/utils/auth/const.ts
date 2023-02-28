export const authRoute = 'onedrive-vercel-index-login'

export const authCookieName = 'od-protected-token'

export const authParamName = 'odpt'

export interface AuthStatus {
  authenticated: string[]
}

export interface SealedPayload {
  payload: string | null
}

export function isPathPasswordRecord(record: unknown): record is Record<string, string> {
  if (typeof record !== 'object' || record === null) return false
  for (const key in record) {
    if (!key.startsWith('/') || typeof record[key] !== 'string') return false
  }
  return true
}

declare module 'iron-session' {
  interface IronSessionData {
    passwords?: Record<string, boolean>
  }
}

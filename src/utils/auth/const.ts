export const authRoute = 'onedrive-vercel-index-login'

export const authCookieName = 'od-protected-token'

export const authParamName = 'odpt'

export interface AuthStatus {
  authenticated: string[]
}

export interface SealProps {
  ttl: number
  url: string
}

export interface SealedUrl {
  url: string
}

export function isSealProps(obj: unknown): obj is SealProps {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'ttl' in obj &&
    'url' in obj &&
    typeof obj.ttl === 'number' &&
    typeof obj.url === 'string'
  )
}

declare module 'iron-session' {
  interface IronSessionData {
    passwords?: Record<string, boolean>
  }
}

if (!process.env.IRON_SESSION_TOKEN) {
  throw new Error('IRON_SESSION_TOKEN is not set')
}

export const IronSessionToken = process.env.IRON_SESSION_TOKEN

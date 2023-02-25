'use client'

import { useCookies } from 'react-cookie'
import { protectedToken } from './cookie'
import { encryptToken, matchProtectedRoute } from './protectedRouteHandler'

export function useStoredToken(path: string): string | null {
  const [{ 'od-protected-token': tokens }] = useCookies([protectedToken])
  if (typeof window !== 'undefined') {
    return null
  }
  const token = tokens?.[matchProtectedRoute(path)]

  if (typeof token !== 'string') {
    return null
  }
  return token
}

export function useClearAllToken() {
  const [, , remove] = useCookies([protectedToken])
  return () => remove(protectedToken, { path: '/' })
}

export function useSetPersistedToken(path: string) {
  const authTokenPath = matchProtectedRoute(path)

  const [{ 'od-protected-token': tokens = {} }, set] = useCookies([protectedToken])
  return (password: string) =>
    set(
      'od-protected-token',
      { ...tokens, [authTokenPath]: encryptToken(password) },
      { path: '/', sameSite: 'strict', secure: true, maxAge: 60 * 60 * 24 * 365 }
    )
}

import { cookies } from 'next/headers'
import { protectedToken } from './cookie'
import { matchProtectedRoute } from './protectedRouteHandler'

export function useTokenPresent(): boolean {
  return cookies().has(protectedToken)
}

export function useToken(path: string): string | null {
  const tokensStr = cookies().get(protectedToken)?.value
  if (!tokensStr) return null
  try {
    const tokens = JSON.parse(tokensStr)
    const token = tokens?.[matchProtectedRoute(path)]
    if (!token || typeof token !== 'string') return null
    return token
  } catch (err) {
    return null
  }
}

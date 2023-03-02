import { genAccessToken } from './gen-at'
import { accessToken, refreshToken, saveAuthToken } from './store'

declare global {
  var cache: { accessToken: string; expiry: number } | undefined
  var rtCache: string | undefined
}

export class NoAccessTokenError extends Error {
  constructor() {
    super('No access token')
  }
}

export async function getAccessToken(): Promise<string> {
  if (globalThis.cache && Date.now() < globalThis.cache.expiry) {
    return globalThis.cache.accessToken
  }
  const [at, expiry] = await accessToken()
  if (at && expiry && Date.now() < expiry) {
    globalThis.cache = { accessToken: at, expiry }
    return at
  }
  const rt = globalThis.rtCache ?? (await refreshToken())
  if (!rt) throw new NoAccessTokenError()
  globalThis.rtCache = rt

  const result = await genAccessToken(rt)
  if (!result) throw new NoAccessTokenError()

  const [newAt, newExpiry] = result
  globalThis.cache = { accessToken: newAt, expiry: newExpiry }
  await saveAuthToken(globalThis.cache)
  return newAt
}

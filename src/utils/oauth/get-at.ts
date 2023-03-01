import { genAccessToken } from './gen-at'
import { accessToken, refreshToken, saveAuthToken } from './store'

let cache: { accessToken: string; expiry: number } | null = null
let rtCache: string | null = null

export class NoAccessTokenError extends Error {
  constructor() {
    super('No access token')
  }
}

export async function getAccessToken(): Promise<string> {
  if (cache !== null && Date.now() < cache.expiry) {
    return cache.accessToken
  }
  const [at, expiry] = await accessToken()
  if (at && expiry && Date.now() < expiry) {
    cache = { accessToken: at, expiry }
    return at
  }
  const rt = rtCache ?? (await refreshToken())
  if (!rt) throw new NoAccessTokenError()
  rtCache = rt

  const result = await genAccessToken(rt)
  if (!result) throw new NoAccessTokenError()

  const [newAt, newExpiry] = result
  cache = { accessToken: newAt, expiry: newExpiry }
  await saveAuthToken(cache)
  return newAt
}

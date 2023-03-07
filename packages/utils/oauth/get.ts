/// <reference types="next" />

import { accessKey, authHeader } from '@od/cfg/auth'
import { helperApi } from '@od/cfg/api'

export async function getAccessToken(): Promise<string> {
  const resp = await fetch(new URL('/api/access', helperApi), {
    method: 'GET',
    headers: { [authHeader]: accessKey },
    next: { revalidate: 10 },
  })
  const payload = await resp.json()
  if (!resp.ok) {
    if (resp.status === 404) {
      throw new NoAccessTokenError()
    }
    throw new Error(payload.error)
  }
  return payload.access_token
}

export class NoAccessTokenError extends Error {
  constructor() {
    super('No access token found.')
  }
}

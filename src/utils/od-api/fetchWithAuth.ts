import { getAccessToken } from '../api/common'
import { Redis } from '../odAuthTokenStore'

export class NoAccessTokenError extends Error {
  constructor() {
    super('No access token')
  }
}

export async function fetchWithAuth(
  input: RequestInfo | URL,
  _init: (RequestInit & { kv: Redis }) | (RequestInit & { accessToken: string })
) {
  const { kv, accessToken: _at, ...init } = _init as RequestInit & { kv?: Redis; accessToken?: string }
  let accessToken = _at
  if (!accessToken) {
    if (!kv) throw new Error('neither kv store or accessToken is provided')
    accessToken = await getAccessToken(kv)
  }
  if (!accessToken) throw new NoAccessTokenError()
  return fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  }).then(res => (res.ok ? res : Promise.reject(new Error(res.statusText))))
}

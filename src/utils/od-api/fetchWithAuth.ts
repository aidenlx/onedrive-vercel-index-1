import { getAccessToken } from '../oauth/get-at'

export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit) {
  const accessToken = await getAccessToken()
  return fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  }).then(res => (res.ok ? res : Promise.reject(res)))
}

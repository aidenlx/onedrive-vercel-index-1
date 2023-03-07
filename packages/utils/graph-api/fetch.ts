import { getAccessToken } from '../oauth/get'

export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit) {
  const accessToken = await getAccessToken()
  return fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${accessToken}`,
    },
  }).then(readResp())
}

export function readResp(): (resp: Response) => Promise<Response>
export function readResp(output: 'text'): (resp: Response) => Promise<string>
export function readResp(output: 'json'): <T = unknown>(resp: Response) => Promise<T>
export function readResp(output?: 'json' | 'text'): (resp: Response) => Promise<any> {
  return async resp => {
    if (resp.ok) {
      if (!output) return resp
      switch (output) {
        case 'json':
          return resp.json()
        case 'text':
          return resp.text()
        default:
          throw new Error(`Invalid output type: ${output}`)
      }
    }

    const errorMessage = await resp
      .json()
      .catch(() => resp.text())
      .catch(() => resp.statusText)
console.error(errorMessage)
    throw new RespError(errorMessage, resp)
  }
}

export class RespError extends Error {
  constructor(public message: any, resp: Response) {
    super(`Error ${resp.status}@${resp.url}: ${JSON.stringify(message)}`)
  }
}

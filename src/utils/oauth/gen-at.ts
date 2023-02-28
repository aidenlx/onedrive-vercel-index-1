import { authApi, clientId, redirectUri } from '@cfg/api.config'
import { clientSecret } from '@/utils/oauth/const'

/**
 * Fetch the access token from Redis storage and check if the token requires a renew
 *
 * @returns Access token for OneDrive API
 */
export async function genAccessToken(refreshToken: string) {
  // Fetch new access token with in storage refresh token
  const body = new URLSearchParams()
  body.append('client_id', clientId)
  body.append('redirect_uri', redirectUri)
  body.append('client_secret', clientSecret)
  body.append('refresh_token', refreshToken)
  body.append('grant_type', 'refresh_token')

  const now = Date.now()
  const data = await fetch(authApi, {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  }).then(resp => (resp.ok ? (resp.json() as Promise<unknown>) : Promise.reject(resp)))

  if (
    isObject(data) &&
    typeof data.access_token === 'string' &&
    typeof data.refresh_token === 'string' &&
    typeof data.expires_in === 'number'
  ) {
    // expires_in is in seconds
    // https://learn.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow#successful-response-2
    const { expires_in, access_token } = data
    return [access_token, now + expires_in * 1e3, expires_in] as [token: string, expiry: number, maxage: number]
  }

  return null
}

function isObject(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null
}

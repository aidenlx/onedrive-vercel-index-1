import { clientId, redirectUri, authApi, scope, obfuscatedClientSecret, driveApi } from '@cfg/api.config'
import { fetchWithAuth } from '../od-api/fetchWithAuth'
import { revealObfuscatedToken, obfuscateToken } from './const'

// Generate the Microsoft OAuth 2.0 authorization URL, used for requesting the authorisation code
export function generateAuthorisationUrl(): string {
  const authUrl = authApi.replace('/token', '/authorize')

  // Construct URL parameters for OAuth2
  const params = new URLSearchParams()
  params.append('client_id', clientId)
  params.append('redirect_uri', redirectUri)
  params.append('response_type', 'code')
  params.append('scope', scope)
  params.append('response_mode', 'query')

  return `${authUrl}?${params.toString()}`
}

// The code returned from the Microsoft OAuth 2.0 authorization URL is a request URL with hostname
// http://localhost and URL parameter code. This function extracts the code from the request URL
export function extractAuthCodeFromRedirected(url: string): string {
  // Return empty string if the url is not the defined redirect uri
  if (!url.startsWith(redirectUri)) {
    return ''
  }

  // New URL search parameter
  const params = new URLSearchParams(url.split('?')[1])
  return params.get('code') ?? ''
}

// After a successful authorisation, the code returned from the Microsoft OAuth 2.0 authorization URL
// will be used to request an access token. This function requests the access token with the authorisation code
// and returns the access token and refresh token on success.
export async function requestTokenWithAuthCode(
  code: string
): Promise<
  | { expiryTime: string; accessToken: string; refreshToken: string }
  | { error: string; errorDescription: string; errorUri: string }
> {
  const clientSecret = revealObfuscatedToken(obfuscatedClientSecret)

  // Construct URL parameters for OAuth2
  const url = new URL(authApi)
  url.searchParams.append('client_id', clientId)
  url.searchParams.append('redirect_uri', redirectUri)
  url.searchParams.append('client_secret', clientSecret)
  url.searchParams.append('code', code)
  url.searchParams.append('grant_type', 'authorization_code')

  // Request access token

  const response = await fetch(url.href, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  const data = await response.json()
  if (!response.ok) {
    const { error, error_description, error_uri } = data
    return { error, errorDescription: error_description, errorUri: error_uri }
  }
  const { expires_in, access_token, refresh_token } = data
  return { expiryTime: expires_in, accessToken: access_token, refreshToken: refresh_token }
}

// Verify the identity of the user with the access token and compare it with the userPrincipalName
// in the Microsoft Graph API. If the userPrincipalName matches, proceed with token storing.
export async function getAuthPersonInfo(accessToken: string) {
  const profileApi = driveApi.replace('/drive', '')
  return await fetchWithAuth(profileApi).then(res => res.json())
}

export async function sendTokenToServer(accessToken: string, refreshToken: string, expiryTime: string) {
  await fetch('/api', {
    method: 'POST',
    body: JSON.stringify({
      obfuscatedAccessToken: obfuscateToken(accessToken),
      accessTokenExpiry: parseInt(expiryTime),
      obfuscatedRefreshToken: obfuscateToken(refreshToken),
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

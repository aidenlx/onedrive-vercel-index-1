import { NextRequest } from 'next/server'
import { setCaching, noCacheForProtectedPath, ResponseCompat } from '@/utils/api/common'
import { handleRaw } from './raw'
import { resolveRoot } from '../path'
import { checkAuthRoute } from '../auth/session'
import { revealObfuscatedToken } from '../oauth/const'
import { saveAuthToken } from '../oauth/store'

export default async function handler(req: NextRequest) {
  // If method is POST, then the API is called by the client to store acquired tokens
  if (req.method === 'POST') {
    const { obfuscatedAccessToken, accessTokenExpiry: expiry, obfuscatedRefreshToken } = await req.json()
    const accessToken = revealObfuscatedToken(obfuscatedAccessToken)
    const refreshToken = revealObfuscatedToken(obfuscatedRefreshToken)

    if (typeof accessToken !== 'string' || typeof refreshToken !== 'string') {
      return ResponseCompat.text('Invalid request body', { status: 400 })
    }

    await saveAuthToken({ accessToken, expiry, refreshToken })
    return ResponseCompat.text('OK', { status: 200 })
  }

  // If method is GET, then the API is a normal request to the OneDrive API for files or folders
  const search = req.nextUrl.searchParams

  const path = search.get('path') ?? '/',
    raw = search.has('raw')

  const headers = new Headers()

  setCaching(headers)

  // Sometimes the path parameter is defaulted to '[...path]' which we need to handle
  if (path === '[...path]') {
    return ResponseCompat.json({ error: 'No path specified.' }, { status: 400, headers })
  }
  // If the path is not a valid path, return 400
  if (typeof path !== 'string') {
    return ResponseCompat.json({ error: 'Path query invalid.' }, { status: 400, headers })
  }
  // Besides normalizing and making absolute, trailing slashes are trimmed
  const cleanPath = resolveRoot(path)

  // Handle protected routes authentication
  const { code, message } = await checkAuthRoute(req, cleanPath)
  // Status code other than 200 means user has not authenticated yet
  if (code !== 200) {
    return ResponseCompat.json({ error: message }, { status: code, headers })
  }
  noCacheForProtectedPath(headers, message)

  // Go for file raw download link, add CORS headers, and redirect to @microsoft.graph.downloadUrl
  // (kept here for backwards compatibility, and cache headers will be reverted to no-cache)
  if (raw) {
    return await handleRaw({ headers, cleanPath })
  }

  // logic moved to server component
  return ResponseCompat.text('Not implemented', { status: 501 })
}

/**
 * Extract next page token from full @odata.nextLink
 */
function getSkipToken(folderData: any) {
  return folderData['@odata.nextLink']?.match(/&\$skiptoken=(.+)/i)[1] ?? null
}

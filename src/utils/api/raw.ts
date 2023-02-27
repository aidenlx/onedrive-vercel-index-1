import { encodePath, getAccessToken, checkAuthRoute, noCacheForProtectedPath, ResponseCompat } from '@/utils/api/common'
import { NextRequest } from 'next/server'
import { Redis } from '@/utils/odAuthTokenStore'
import { cacheControlHeader } from '@cfg/api.config'
import { handleResponseError } from './common'
import { getHashedToken } from '@/utils/auth/utils'
import { resolveRoot } from '../path'
import { getDownloadLink } from '../getDownloadLink'

export default async function handler(kv: Redis, req: NextRequest) {
  const accessToken = await getAccessToken(kv)
  if (!accessToken) {
    return ResponseCompat.json({ error: 'No access token.' }, { status: 403 })
  }

  const search = req.nextUrl.searchParams

  const path = search.get('path') ?? '/',
    odpt = search.get('odpt') ?? '',
    proxy = search.has('proxy')

  // Sometimes the path parameter is defaulted to '[...path]' which we need to handle
  if (path === '[...path]') {
    return ResponseCompat.json({ error: 'No path specified.' }, { status: 400 })
  }
  // If the path is not a valid path, return 400
  if (typeof path !== 'string') {
    return ResponseCompat.json({ error: 'Path query invalid.' }, { status: 400 })
  }
  const cleanPath = resolveRoot(path)

  // Handle protected routes authentication
  let odTokenHeader = (await getHashedToken(req, cleanPath)) ?? odpt

  const { code, message } = await checkAuthRoute(cleanPath, accessToken, odTokenHeader)
  // Status code other than 200 means user has not authenticated yet
  if (code !== 200) {
    return ResponseCompat.json({ error: message }, { status: code })
  }

  const headers = noCacheForProtectedPath(new Headers(), message)
  return await handleRaw({ headers: headers, cleanPath, accessToken }, proxy)
}

export async function handleRaw(ctx: { headers?: Headers; cleanPath: string; accessToken: string }, proxy = false) {
  const init = { headers: ctx.headers ?? new Headers(), cors: true }
  try {
    const [downloadUrl, size] = await getDownloadLink(ctx.cleanPath, ctx.accessToken)

    if (!downloadUrl) {
      // CDN Cache for 1 hour
      // https://learn.microsoft.com/en-us/graph/api/resources/driveitem?view=graph-rest-1.0#instance-attributes
      init.headers.set('Cache-Control', 'public, max-age=0, s-maxage=3600, immutable')
      return ResponseCompat.json({ error: 'No download url found.' }, { status: 404, ...init })
    }

    // Only proxy raw file content response for files up to 4MB
    if (!(proxy && size && size < 4194304)) {
      // CDN Cache for 1 hour
      // https://learn.microsoft.com/en-us/graph/api/resources/driveitem?view=graph-rest-1.0#instance-attributes
      init.headers.set('Cache-Control', 'public, max-age=0, s-maxage=3600, immutable')
      return ResponseCompat.redirect(downloadUrl, { status: 308, ...init })
    }

    const { body: dlBody, headers: dlHeader } = await fetch(downloadUrl)
    dlHeader.set('Cache-Control', cacheControlHeader)

    if (!dlBody)
      return ResponseCompat.json(
        { error: 'No body from requested download URL.', url: downloadUrl },
        { status: 404, ...init }
      )

    return ResponseCompat.stream(dlBody, { status: 200, ...init, headers: dlHeader })
  } catch (error) {
    const { data, status } = await handleResponseError(error)
    return ResponseCompat.json(data, { status, ...init })
  }
}

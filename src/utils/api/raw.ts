import { noCacheForProtectedPath, ResponseCompat, setCaching, setRawUrlCaching } from '@/utils/api/common'
import { checkAuthRoute } from '../auth/session'
import { NextRequest } from 'next/server'
import { cacheControlHeader } from '@cfg/api.config'
import { handleResponseError } from './common'
import { resolveRoot } from '../path'
import { getDownloadLink } from '@/utils/od-api/getDownloadLink'

export default async function handler(req: NextRequest) {
  const search = req.nextUrl.searchParams

  const path = search.get('path') ?? '/',
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
  const { code, message } = await checkAuthRoute(req, cleanPath)
  // Status code other than 200 means user has not authenticated yet
  if (code !== 200) {
    return ResponseCompat.json({ error: message }, { status: code })
  }

  const headers = noCacheForProtectedPath(new Headers(), message)

  return await handleRaw({ headers, cleanPath }, proxy)
}

export async function handleRaw(ctx: { headers?: Headers; cleanPath: string }, proxy = false) {
  const init = { headers: ctx.headers ?? new Headers(), cors: true }
  try {
    const [downloadUrl, size] = await getDownloadLink(ctx.cleanPath)

    setRawUrlCaching(init.headers)
    if (!downloadUrl) {
      return ResponseCompat.json({ error: 'No download url found.' }, { status: 404, ...init })
    }

    // Only proxy raw file content response for files up to 4MB
    if (!(proxy && size && size < 4194304)) {
      return ResponseCompat.redirect(downloadUrl, { status: 308, ...init })
    }

    const { body: dlBody, headers: dlHeader } = await fetch(downloadUrl)
    // override cache control header for proxied resopnse
    setCaching(dlHeader)
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

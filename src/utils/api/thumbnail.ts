import type { OdThumbnail } from '@/types'

import { setCaching, noCacheForProtectedPath, handleResponseError, ResponseCompat } from '@/utils/api/common'
import { checkAuthRoute } from '../auth/session'
import { NextRequest } from 'next/server'
import { resolveRoot } from '../path'
import { getRequsetURL } from '../od-api/odRequest'
import { fetchWithAuth } from '../od-api/fetchWithAuth'

export default async function handler(req: NextRequest) {
  // Get item thumbnails by its path since we will later check if it is protected
  const search = req.nextUrl.searchParams,
    path = search.get('path') ?? '',
    size = search.get('size') ?? 'medium',
    odpt = search.get('odpt') ?? ''

  const headers = new Headers()

  // Check whether the size is valid - must be one of 'large', 'medium', or 'small'
  if (size !== 'large' && size !== 'medium' && size !== 'small') {
    return ResponseCompat.json({ error: 'Invalid size' }, { status: 400, headers })
  }
  // Sometimes the path parameter is defaulted to '[...path]' which we need to handle
  if (path === '[...path]') {
    return ResponseCompat.json({ error: 'No path specified.' }, { status: 400, headers })
  }
  // If the path is not a valid path, return 400
  if (typeof path !== 'string') {
    return ResponseCompat.json({ error: 'Path query invalid.' }, { status: 400, headers })
  }
  const cleanPath = resolveRoot(path)
  // Set edge function caching for faster load times, if route is not protected, check docs:
  // https://vercel.com/docs/concepts/functions/edge-caching
  setCaching(headers)

  const { code, message } = await checkAuthRoute(req, cleanPath)
  // Status code other than 200 means user has not authenticated yet
  if (code !== 200) {
    return ResponseCompat.json({ error: message }, { status: code, headers })
  }
  noCacheForProtectedPath(headers, message)

  // Handle response from OneDrive API
  const requestUrl = getRequsetURL(cleanPath, true, 'thumbnails')
  try {
    const data = await fetchWithAuth(requestUrl).then(res => res.json())

    const thumbnailUrl = data.value && data.value.length > 0 ? (data.value[0] as OdThumbnail)[size].url : null
    if (!thumbnailUrl) {
      return ResponseCompat.json({ error: "The item doesn't have a valid thumbnail." }, { status: 400, headers })
    }
    return ResponseCompat.redirect(thumbnailUrl, { headers })
  } catch (error) {
    const { data, status } = await handleResponseError(error)
    return ResponseCompat.json(data, { status, headers })
  }
}

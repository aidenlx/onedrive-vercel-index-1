import { matchProtectedRoute } from '@od/util/protect'
import { isRouteUnlocked } from '@od/util/protect/session'
import { NextRequest, NextResponse } from 'next/server'
import { resolveRoot } from '@od/util/path'
import { fetchWithAuth, getRequestURL, encodePath } from '@od/util/graph-api'
import { cors } from '@od/util/cors.web'
import { cacheResourceUrl, handleResponseError } from '@od/util/resp-handler'
import type { ThumbnailSet } from '@od/util/graph-api/type'

export const config = { runtime: 'edge' }

async function GET(req: NextRequest) {
  // Get item thumbnails by its path since we will later check if it is protected
  const search = req.nextUrl.searchParams,
    path = search.get('path') ?? '',
    size = search.get('size') ?? 'medium',
    odpt = search.get('odpt') ?? ''

  // Check whether the size is valid - must be one of 'large', 'medium', or 'small'
  if (size !== 'large' && size !== 'medium' && size !== 'small') {
    return NextResponse.json({ error: 'Invalid size' }, { status: 400 })
  }
  // Sometimes the path parameter is defaulted to '[...path]' which we need to handle
  if (path === '[...path]') {
    return NextResponse.json({ error: 'No path specified.' }, { status: 400 })
  }
  // If the path is not a valid path, return 400
  if (typeof path !== 'string') {
    return NextResponse.json({ error: 'Path query invalid.' }, { status: 400 })
  }
  const cleanPath = resolveRoot(path)

  // Handle response from OneDrive API
  const requestUrl = getRequestURL(encodePath(cleanPath), 'thumbnails')
  const protectedRoute = matchProtectedRoute(cleanPath)

  if (protectedRoute && !(await isRouteUnlocked(req, protectedRoute))) {
    return NextResponse.json({ error: 'Password required' }, { status: 401 })
  }

  const headers = {
    'Cache-Control': protectedRoute ? 'no-cache' : cacheResourceUrl,
  }
  try {
    const data: { value: ThumbnailSet[] } = await fetchWithAuth(requestUrl).then(res => res.json())

    const thumbnailUrl = data.value?.[0][size]?.url ?? null

    const resp = thumbnailUrl
      ? NextResponse.redirect(thumbnailUrl)
      : NextResponse.json({ error: "The item doesn't have a valid thumbnail." }, { status: 400 })

    if (!protectedRoute) {
      resp.headers.set('Cache-Control', cacheResourceUrl)
    }
    return await cors(req, resp)
  } catch (error) {
    const { data, status } = await handleResponseError(error)
    return NextResponse.json(data, { status })
  }
}

export default function handler(res: NextRequest) {
  switch (res.method) {
    case 'GET':
      return GET(res)
    default:
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }
}
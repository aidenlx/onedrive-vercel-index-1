import { NextRequest, NextResponse } from 'next/server'
import { resolveRoot } from '@od/util/path'
import { cors } from '@od/util/cors.web'
import { matchProtectedRoute } from '@od/util/protect'
import { isRouteUnlocked } from '@od/util/protect/session'
import { handleRaw } from '@od/util/resp-handler'

export const config = { runtime: 'edge' }

async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams

  const path = search.get('path') ?? '/',
    proxy = search.has('proxy')

  // Sometimes the path parameter is defaulted to '[...path]' which we need to handle
  if (path === '[...path]') {
    return NextResponse.json({ error: 'No path specified.' }, { status: 400 })
  }
  // If the path is not a valid path, return 400
  if (typeof path !== 'string') {
    return NextResponse.json({ error: 'Path query invalid.' }, { status: 400 })
  }
  const cleanPath = resolveRoot(path)

  const protectedRoute = matchProtectedRoute(cleanPath)

  if (protectedRoute && !(await isRouteUnlocked(req, protectedRoute))) {
    return NextResponse.json({ error: 'Password required' }, { status: 401 })
  }

  const resp = await handleRaw(cleanPath, { proxy })
  if (protectedRoute) {
    resp.headers.delete('Cache-Control')
  }
  return await cors(req, resp)
}

export default function handler(res: NextRequest) {
  switch (res.method) {
    case 'GET':
      return GET(res)
    default:
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }
}

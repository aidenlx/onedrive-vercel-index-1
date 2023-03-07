import { authHeader, accessKey } from '@od/cfg/auth'
import { cors } from '@od/util/cors.web'
import { handleRaw, handleResponseError } from '@od/util/resp-handler'
import { NextResponse } from 'next/server'

export const config = { runtime: 'edge' }

// serve access token via CDN cache to reduce API calls
async function GET(req: Request) {
  if (accessKey !== req.headers.get(authHeader)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const resp = await handleRaw('site.config.json', {
      proxy: true,
      basePath: '/',
      cacheControl: 's-maxage=1, stale-while-revalidate',
    })
    return await cors(req, resp)
  } catch (error) {
    const { data, status } = await handleResponseError(error)
    return NextResponse.json(data, { status })
  }
}

export default function handler(req: Request) {
  switch (req.method) {
    case 'GET':
      return GET(req)
    default:
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }
}

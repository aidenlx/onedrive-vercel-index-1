import { authHeader, accessKey, refreshToken } from '@od/cfg/auth'
import { reqAccessToken } from '@od/util/oauth'
import { handleResponseError } from '@od/util/resp-handler'
import { NextResponse } from 'next/server'

export const config = { runtime: 'edge' }

// serve access token via CDN cache to reduce API calls
async function GET(req: Request) {
  if (accessKey !== req.headers.get(authHeader)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!refreshToken) return NextResponse.json({ error: 'Refresh token not configured' }, { status: 500 })

  try {
    const result = await reqAccessToken(refreshToken)
    if (!result) return NextResponse.json({ error: 'Invalid refresh token' }, { status: 500 })

    const [access_token, _, maxage] = result
    return NextResponse.json(
      { access_token },
      {
        headers: {
          'Cache-Control': `public, max-age=0, s-maxage=${maxage}, immutable`,
        },
        status: 200,
      }
    )
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

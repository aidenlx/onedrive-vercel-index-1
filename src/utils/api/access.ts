import { clientId } from '@cfg/api.config'
import { genAccessToken } from '@/utils/oauth/gen-at'
import { NextRequest, NextResponse } from 'next/server'
import { clientSecret } from '@/utils/oauth/const'

// serve access token via CDN cache to reduce API calls
// not used in this project yet

export default async function handler(req: NextRequest) {
  if (req.method !== 'GET') return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })

  const refreshToken = process.env.REFRESH_TOKEN

  if (clientId !== req.headers.get('client-id') || clientSecret !== req.headers.get('client-secret')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!refreshToken) return NextResponse.json({ error: 'Missing refresh token' }, { status: 401 })

  try {
    const result = await genAccessToken(refreshToken)
    if (!result) return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })

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
    if (error instanceof Error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (error instanceof Response)
      return NextResponse.json({ error: (await error.json()) ?? error.statusText }, { status: error.status })
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

import { protectedRoutes } from '@od/cfg/api'
import { IronSessionData, sealData } from 'iron-session/edge'
import { NextRequest, NextResponse } from 'next/server'
import type { SealedPayload } from '@od/util/protect'
import { cors } from '@od/util/cors.web'
import { IronSessionToken, getSession, isAuthed } from '@od/util/protect/session'

export const config = { runtime: 'edge' }

function getTtl(req: NextRequest) {
  const _ttl = req.nextUrl.searchParams.get('ttl')
  return _ttl ? parseInt(_ttl) : -1
}

async function GET(req: NextRequest) {
  const [res, session] = await getSession(req)
  if (!session) return res

  const route = req.nextUrl.searchParams.get('route'),
    ttl = getTtl(req)

  if (ttl <= 0 || !route) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })

  if (!protectedRoutes.includes(route))
    return NextResponse.json({ payload: null } satisfies SealedPayload, { status: 200 })
  const authenticated = await isAuthed(session, route)
  if (!authenticated) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const token: IronSessionData = { passwords: { [route]: true } }
  const sealed = await sealData(token, { password: IronSessionToken, ttl })
  return await cors(
    req,
    NextResponse.json({ payload: sealed } satisfies SealedPayload, {
      status: 201,
      headers: {
        'Cache-Control': `private, must-revalidate, max-age=${ttl}`,
      },
    })
  )
}

export default function handler(res: NextRequest) {
  switch (res.method) {
    case 'GET':
      return GET(res)
    default:
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }
}

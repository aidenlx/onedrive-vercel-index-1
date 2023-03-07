import { protectedRoutes } from '@od/cfg/api'
import { IronSessionData, sealData } from 'iron-session/edge'
import { NextRequest, NextResponse } from 'next/server'
import { SealedPayload } from './const'
import { IronSessionToken } from './session'
import { getSession, isAuthed } from './session'

export async function sealUrl(req: NextRequest) {
  const [res, session] = await getSession(req)
  if (!session) return res

  const _ttl = req.nextUrl.searchParams.get('ttl'),
    route = req.nextUrl.searchParams.get('route'),
    ttl = _ttl ? parseInt(_ttl) : -1

  if (ttl <= 0 || !route) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })

  if (!protectedRoutes.includes(route))
    return NextResponse.json({ payload: null } satisfies SealedPayload, { status: 200 })
  const authenticated = await isAuthed(session, route)
  if (!authenticated) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const token: IronSessionData = { passwords: { [route]: true } }
  const sealed = await sealData(token, { password: IronSessionToken, ttl })
  return NextResponse.json({ payload: sealed } satisfies SealedPayload, {
    status: 201,
    headers: {
      'Cache-Control': `private, must-revalidate, max-age=${ttl}`,
    },
  })
}

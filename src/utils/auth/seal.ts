import { IronSessionData, sealData } from 'iron-session/edge'
import { NextRequest, NextResponse } from 'next/server'
import { SealedPayload } from './const'
import { IronSessionToken } from './session'
import { getSession, isAuthed } from './session'
import { matchProtectedRoute } from './utils'

export async function sealUrl(req: NextRequest) {
  const [res, session] = await getSession(req)
  if (!session) return res

  const _ttl = req.nextUrl.searchParams.get('ttl'),
    path = req.nextUrl.searchParams.get('path'),
    ttl = _ttl ? parseInt(_ttl) : -1

  if (ttl <= 0 || !path) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })

  const route = matchProtectedRoute(path)
  if (!route) return NextResponse.json({ payload: null } satisfies SealedPayload, { status: 200 })
  const authenticated = await isAuthed(session, route)
  if (!authenticated) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const token: IronSessionData = { passwords: { [route]: true } }
  const sealed = await sealData(token, { password: IronSessionToken, ttl })
  return NextResponse.json({ payload: sealed } satisfies SealedPayload, { status: 201 })
}

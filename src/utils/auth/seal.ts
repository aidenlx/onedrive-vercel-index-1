import { IronSessionData, sealData } from 'iron-session/edge'
import { NextRequest, NextResponse } from 'next/server'
import { authParamName, IronSessionToken, isSealProps } from './const'
import { getSession, isAuthed, matchProtectedRoute } from './utils'

export async function sealUrl(req: NextRequest) {
  const [res, session] = await getSession(req)
  if (!session) return res

  const payload = await req
    .json()
    .then(p => (isSealProps(p) ? p : Promise.reject('Malformed JSON')))
    .catch(() => new Error('Invalid JSON'))

  if (payload instanceof Error) {
    return new Response(payload.message, { status: 400 })
  }

  const { ttl } = payload,
    url = new URL(payload.url, req.url)

  const route = matchProtectedRoute(url.pathname)
  if (!route) return NextResponse.json({ url: url.href }, { status: 200 })
  const authenticated = await isAuthed(session, route)
  if (!authenticated) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const token: IronSessionData = { passwords: { [route]: true } }
  const sealed = await sealData(token, { password: IronSessionToken, ttl })
  url.searchParams.set(authParamName, sealed)
  return NextResponse.json({ url: url.href }, { status: 201 })
}

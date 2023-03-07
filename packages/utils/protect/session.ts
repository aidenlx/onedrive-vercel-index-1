import type { IronSessionData } from 'iron-session'
import { getIronSession, unsealData } from 'iron-session/edge'
import { NextRequest, NextResponse } from 'next/server'
import { authCookieName, authParamName } from './const'

if (!process.env.IRON_SESSION_TOKEN) {
  throw new Error('IRON_SESSION_TOKEN is not set')
}

export const IronSessionToken = process.env.IRON_SESSION_TOKEN

export async function isAuthed(session: IronSessionData, route: string): Promise<boolean> {
  const passwords = session.passwords
  if (!passwords) return false
  return passwords[route] ?? false
}

export async function getSessionData(req: NextRequest) {
  const [_, session] = await getSession(req)
  const sealed = req.nextUrl.searchParams.get(authParamName)
  if (sealed) return (await unsealData(sealed, { password: IronSessionToken })) as IronSessionData
  if (session) return session
  return null
}

export async function getSession(req: NextRequest) {
  const res = NextResponse.next()
  const session = await getIronSession(req, res, {
    cookieName: authCookieName,
    password: IronSessionToken,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
  })
  return [res, session] as const
}

export async function isRouteUnlocked(req: NextRequest, route: string): Promise<boolean> {
  const session = await getSessionData(req)
  return !!session && (await isAuthed(session, route))
}

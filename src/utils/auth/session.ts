import type { IronSessionData } from 'iron-session'
import { getIronSession, unsealData } from 'iron-session/edge'
import { NextRequest, NextResponse } from 'next/server'
import { authCookieName, authParamName } from './const'
import { matchProtectedRoute } from './utils'

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

/**
 * Handles protected route authentication:
 * - Match the cleanPath against an array of user defined protected routes
 * - If a match is found:
 * - 1. Download the .password file stored inside the protected route and parse its contents
 * - 2. Check if the od-protected-token header is present in the request
 * - The request is continued only if these two contents are exactly the same
 *
 * @param cleanPath Sanitised directory path, used for matching whether route is protected
 * @param accessToken OneDrive API access token
 * @param req Next.js request object
 * @param res Next.js response object
 */

export async function checkAuthRoute(
  req: NextRequest,
  path: string
): Promise<{ code: 200 | 401 | 404 | 500; message: string }> {
  // Handle authentication through .password
  const route = matchProtectedRoute(path)

  // If route is not protected, return 200 with empty message
  if (route === null) {
    return { code: 200, message: '' }
  }

  const session = await getSessionData(req)
  if (!session || (await isAuthed(session, route)) !== true) {
    return { code: 401, message: 'Password required.' }
  }

  return { code: 200, message: 'Authenticated.' }
}

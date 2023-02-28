import { protectedRoutes } from '@/../config/site.config'
import type { IronSession } from 'iron-session'
import { getIronSession } from 'iron-session/edge'
import { NextRequest, NextResponse } from 'next/server'
import { authCookieName } from './const'

export async function isAuthed(req: NextRequest, route: string): Promise<[auth: boolean, resp?: Response]> {
  const [respErr, session] = await getSession(req)
  if (!session) return [false, respErr]
  const passwords = session.passwords
  if (!passwords) return [false]
  return [passwords[route] ?? false]
}

/**
 * Match the specified route against a list of predefined routes
 * @param route directory path
 * @returns matched route or null
 */
export async function matchProtectedRoute(path: string) {
  // match the longest route first
  for (const r of protectedRoutes.sort().reverse()) {
    // protected route array could be empty
    if (r && path.startsWith(r)) {
      return r
    }
  }
  return null
}

export function isPathPasswordRecord(record: unknown): record is Record<string, string> {
  if (typeof record !== 'object' || record === null) return false
  for (const key in record) {
    if (!key.startsWith('/') || typeof record[key] !== 'string') return false
  }
  return true
}

export async function getSession(req: NextRequest) {
  if (!process.env.IRON_SESSION_TOKEN) {
    return [new Response('IRON_SESSION_TOKEN is not set', { status: 500 })] as const
  }

  const res = NextResponse.next()
  const session = (await getIronSession(req, res, {
    cookieName: authCookieName,
    password: process.env.IRON_SESSION_TOKEN,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
  })) as IronSession & { passwords?: Record<string, boolean> }
  return [res, session] as const
}

/**
 * Match protected routes in site config to get path to required auth token
 * @param path Path cleaned in advance
 * @returns Path to required auth token. If not required, return empty string.
 */

export function getAuthTokenPath(path: string) {
  // Ensure trailing slashes to compare paths component by component. Same for protectedRoutes.
  // Since OneDrive ignores case, lower case before comparing. Same for protectedRoutes.
  path = path.toLowerCase() + '/'
  let authTokenPath = ''
  for (let r of protectedRoutes) {
    if (typeof r !== 'string') continue
    r = r.toLowerCase().replace(/\/$/, '') + '/'
    if (path.startsWith(r)) {
      authTokenPath = `${r}.password`
      break
    }
  }
  return authTokenPath
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

  const [authenticated] = await isAuthed(req, path)
  if (authenticated === true) {
    return { code: 200, message: 'Authenticated.' }
  }
  return { code: 401, message: 'Password required.' }
}

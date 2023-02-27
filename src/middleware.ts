import { NextFetchEvent, NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { get } from '@vercel/edge-config'

export const config = {
  matcher: ['/api/:path*', '/((?!api|_next|favicon.ico|assets|icons|players|images).*)'],
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return apiRewrite(request)
  } else {
    const resp = intl(request)

    // get real pathname without locale
    let pathname = request.nextUrl.pathname
    if (resp.headers.has('x-middleware-rewrite')) {
      pathname = new URL(resp.headers.get('x-middleware-rewrite')!).pathname
    } else if (resp.headers.has('Location')) {
      pathname = new URL(resp.headers.get('Location')!).pathname
    }
    const [, locale, ...realPaths] = pathname.split('/')
    const realPath = queryToPath(realPaths)

    for (const route of protectedRoutes) {
      if (!realPath.startsWith(route)) continue
      const [req, session] = await getSession(request)
      // return error response if session cannot be retrieved
      if (!session) return req

      const query = new URLSearchParams()
      query.set('route', route)
      const needAuth = NextResponse.redirect(new URL(`/${locale}/${authRoute}${realPath}?${query}`, request.url))

      const password = session.passwords?.[route]
      if (!password) return needAuth

      try {
        const realPassword = await getPassword(realPath)
        if (realPassword && password !== realPassword) return needAuth
        // if no password is set or password matches, allow access
        return resp
      } catch (error) {
        return NextResponse.json(
          { error: error instanceof Error ? error.message : JSON.stringify(error) },
          { status: 500 }
        )
      }
    }
    return resp
  }
}

const pattern = /^\/api\/(?:index|name|item|raw|search|thumbnail)(?=\/|$)/

export async function apiRewrite(request: NextRequest) {
  const original = request.nextUrl

  let { pathname } = original
  if (pathname === '/api/') {
    pathname = '/api/index/'
  }
  if (!pattern.test(pathname)) {
    return NextResponse.next()
  }

  const edgeRuntimeEnabled = process.env.EDGE_CONFIG && (await get<boolean>('edge_runtime'))
  if (!edgeRuntimeEnabled) {
    pathname = pathname.replace(pattern, m => `${m}-v1`)
  } else {
    pathname = pathname.replace(pattern, m => `${m}-v2`)
  }
  const rewritten = new URL(pathname, original)
  original.searchParams.forEach((value, key) => {
    rewritten.searchParams.append(key, value)
  })
  return NextResponse.rewrite(rewritten)
}

import createIntlMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './locale'
import { protectedRoutes } from '../config/site.config'
import { getSession } from './utils/auth/utils'
import { getPassword } from './utils/auth/get-pwd'
import { queryToPath } from './components/page/utils'
import { getAccessToken } from './utils/api/common'
import { authRoute } from './utils/auth/const'

const intl = createIntlMiddleware({
  locales: locales as unknown as string[],
  defaultLocale,
  alternateLinks: true,
})

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

    const route = await matchProtectedRoute(realPath)
    if (!route) return resp

    const [authenticated, respErr] = await isAuthed(request, route)
    if (authenticated === true) return resp
    if (respErr) return respErr

    const query = new URLSearchParams()
    query.set('route', route)
    return NextResponse.redirect(new URL(`/${locale}/${authRoute}${realPath}?${query}`, request.url))
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
import { getSession, isAuthed, matchProtectedRoute } from './utils/auth/utils'
import { queryToPath } from './components/page/utils'
import { authRoute } from './utils/auth/const'

const intl = createIntlMiddleware({
  locales: locales as unknown as string[],
  defaultLocale,
  alternateLinks: true,
})

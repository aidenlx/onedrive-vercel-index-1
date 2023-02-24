import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { get } from '@vercel/edge-config'

export const config = {
  matcher: ['/api/:path*', '/((?!api|_next|favicon.ico|assets|icons|players|images).*)'],
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return apiRewrite(request)
  } else {
    return intl(request)
  }
}

const pattern = /^\/api\/\w+(?=\/|$)/

export async function apiRewrite(request: NextRequest) {
  const original = request.nextUrl

  let { pathname } = original
  if (pathname === '/api/') {
    pathname = '/api/index/'
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

const intl = createIntlMiddleware({
  locales: locales as unknown as string[],
  defaultLocale,
  alternateLinks: true,
})

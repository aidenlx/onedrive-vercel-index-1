import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|assets|icons|players|images).*)', '/assets/pwa/:path*'],
}

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/assets/pwa/')) {
    return NextResponse.next({
      headers: {
        'Service-Worker-Allowed': '/',
      },
    })
  }

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

  const route = matchProtectedRoute(realPath)
  if (!route) return resp

  const session = await getSessionData(request)
  if (session && (await isAuthed(session, route)) === true) return resp

  const query = new URLSearchParams()
  query.set('route', route)
  return NextResponse.redirect(new URL(`/${locale}/${authRoute}${realPath}?${query}`, request.url))
}

import createIntlMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './locale'
import { getSessionData, isAuthed } from './utils/auth/session'
import { matchProtectedRoute } from './utils/auth/utils'
import { queryToPath } from './components/page/utils'
import { authRoute } from './utils/auth/const'

const intl = createIntlMiddleware({
  locales: locales as unknown as string[],
  defaultLocale,
  alternateLinks: true,
})

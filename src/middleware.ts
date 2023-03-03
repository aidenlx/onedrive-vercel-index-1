import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: ['/((?!api|_next|favicon.ico|assets|icons|players|images|sw\.js).*)',],
}

export async function middleware(request: NextRequest) {
  const resp = intl(request)

  // get real pathname without locale
  let pathname = request.nextUrl.pathname
  if (resp.headers.has('x-middleware-rewrite')) {
    pathname = new URL(resp.headers.get('x-middleware-rewrite')!).pathname
  } else if (resp.headers.has('Location')) {
    pathname = new URL(resp.headers.get('Location')!).pathname
  }
  const [, locale, ...realPaths] = pathname.split('/')
  const realPath = getPathFromSegments(realPaths)

  const route = matchProtectedRoute(realPath)
  if (!route) return resp

  const session = await getSessionData(request)
  if (session && (await isAuthed(session, route)) === true) return resp

  return NextResponse.redirect(new URL(`/${locale}/${authRoute}${realPath}`, request.url))
}

import createIntlMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './locale'
import { getSessionData, isAuthed } from './utils/auth/session'
import { matchProtectedRoute } from './utils/auth/utils'
import { authRoute } from './utils/auth/const'
import { getPathFromSegments } from './components/page/utils'

const intl = createIntlMiddleware({
  locales: locales as unknown as string[],
  defaultLocale,
  alternateLinks: true,
})

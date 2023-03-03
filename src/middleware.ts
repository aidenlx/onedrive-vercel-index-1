import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { toCustomisedPermLink } from './utils/permlink'

export const config = {
  matcher: ['/((?!api|_next|assets|icons).*)'],
}

export async function middleware(request: NextRequest) {
  const resp = intl(request)

  const { locale, realPath } = getRealPathFromIntl(request.nextUrl.pathname, resp)

  const protectedRoute = matchProtectedRoute(realPath)
  if (protectedRoute && !(await isRouteAuthed(realPath, request))) {
    return NextResponse.redirect(new URL(`/${locale}/${authRoute}${realPath}`, request.url))
  }

  if (request.nextUrl.searchParams.has('raw')) {
    const name = request.nextUrl.searchParams.get('name') ?? realPath.split('/').pop()! ?? ''
    if (!name) return resp
    const url = toCustomisedPermLink(name, realPath)
    return NextResponse.redirect(new URL(url, request.url), {
      headers: {
        // if route not protected, cache infinitely
        'Cache-Control': protectedRoute ? 'no-store' : 'max-age=0, s-maxage=2147483647',
      },
    })
  }
  return resp
}

/**
 * get real pathname without locale
 */
function getRealPathFromIntl(pathname: string, resp: NextResponse) {
  if (resp.headers.has('x-middleware-rewrite')) {
    pathname = new URL(resp.headers.get('x-middleware-rewrite')!).pathname
  } else if (resp.headers.has('Location')) {
    pathname = new URL(resp.headers.get('Location')!).pathname
  }
  const [, locale, ...realPaths] = pathname.split('/')
  return { locale, realPath: getPathFromSegments(realPaths) }
}

async function isRouteAuthed(route: string, request: NextRequest) {
  const session = await getSessionData(request)
  return !!session && (await isAuthed(session, route)) === true
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

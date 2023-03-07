import { NextRequest, NextResponse } from 'next/server'

export function GET(req: NextRequest) {
  // (kept here for backwards compatibility)
  const search = req.nextUrl.searchParams
  if (search.has('path') && search.has('raw')) {
    return NextResponse.redirect(new URL(`/api/raw?${search.toString()}`, req.url))
  }
  return new NextResponse('API entrypoint not found', { status: 404 })
}

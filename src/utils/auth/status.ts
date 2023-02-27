import { NextRequest, NextResponse } from 'next/server'
import { AuthStatus } from './const'
import { getSession } from './utils'

export async function checkStatus(req: NextRequest) {
  const [res, session] = await getSession(req)
  if (!session) return res
  const response: AuthStatus = { authenticated: session.passwords ? Object.keys(session.passwords) : [] }
  return NextResponse.json(response)
}

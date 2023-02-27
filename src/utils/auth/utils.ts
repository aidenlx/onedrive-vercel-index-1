import { getIronSession } from 'iron-session/edge'
import type { IronSession } from 'iron-session'
import { NextRequest, NextResponse } from 'next/server'
import { authCookieName } from './const'

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
  })) as IronSession & { passwords?: Record<string, string> }
  return [res, session] as const
}

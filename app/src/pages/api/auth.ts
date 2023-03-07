import { NextRequest, NextResponse } from 'next/server'
import { isPathPasswordRecord } from '@od/util/protect'
import { getSession } from '@od/util/protect/session'
import getRoutePassword from '@od/util/protect/get-pwd'
import type { AuthStatus } from '@od/util/protect'
import pLimit from 'p-limit'

export const config = { runtime: 'edge' }

async function GET(req: NextRequest) {
  const [res, session] = await getSession(req)
  if (!session) return res
  const response: AuthStatus = { authenticated: session.passwords ? Object.keys(session.passwords) : [] }
  return NextResponse.json(response)
}

async function POST(req: NextRequest) {
  const [res, session] = await getSession(req)
  if (!session) return res

  const payload = await req
    .json()
    .then(json => (isPathPasswordRecord(json) ? json : new Error('Malformed JSON')))
    .catch(() => new Error('Invalid JSON'))

  if (payload instanceof Error) {
    return new Response(payload.message, { status: 400 })
  }

  const limit = pLimit(5)
  const getPassword = (path: string) => limit(() => getRoutePassword(path))

  const authResult = Object.fromEntries(
    await Promise.all(
      Object.entries(payload).map(async ([path, userPwd]) => {
        const realPwd = await getPassword(path)
        return [path, !!realPwd && userPwd === realPwd] as const
      })
    )
  )

  session.passwords = { ...(session.passwords ?? {}), ...authResult }
  await session.save()
  return res
}

async function DELETE(req: NextRequest) {
  const [res, session] = await getSession(req)
  if (!session) return res
  session.destroy()
  return res
}

export default function handler(res: NextRequest) {
  switch (res.method) {
    case 'GET':
      return GET(res)
    case 'POST':
      return POST(res)
    case 'DELETE':
      return DELETE(res)
    default:
      return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
  }
}

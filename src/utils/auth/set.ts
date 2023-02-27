import type { NextRequest } from 'next/server'
import { getSession, isPathPasswordRecord } from './utils'

export async function setPassword(req: NextRequest) {
  const [res, session] = await getSession(req)
  if (!session) return res

  const payload = await req
    .json()
    .then(json => (isPathPasswordRecord(json) ? json : new Error('Malformed JSON')))
    .catch(() => new Error('Invalid JSON'))

  if (payload instanceof Error) {
    return new Response(payload.message, { status: 400 })
  }
  session.passwords = { ...(session.passwords ?? {}), ...payload }
  await session.save()
  return res
}

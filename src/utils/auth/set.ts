import type { NextRequest } from 'next/server'
import pLimit from 'p-limit'
import { getPassword as getPwd } from './get-pwd'
import { getSession } from './session'
import { isPathPasswordRecord } from './const'

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

  const limit = pLimit(5)
  const getPassword = (path: string) => limit(() => getPwd(path))

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

import type { NextRequest } from 'next/server'
import { getSession } from './utils'

export async function clearPassword(req: NextRequest) {
  const [res, session] = await getSession(req)
  if (!session) return res
  session.destroy()
  return res
}

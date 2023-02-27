import { NextRequest, NextResponse } from 'next/server'
import { setPassword } from '@/utils/auth/set'
import { checkStatus } from '@/utils/auth/status'
import { clearPassword } from '@/utils/auth/clear'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  switch (req.method) {
    case 'GET':
      return await checkStatus(req)
    case 'POST':
      return await setPassword(req)
    case 'DELETE':
      return await clearPassword(req)
    default:
      return NextResponse.json({ error: 'Invalid request method.' }, { status: 400 })
  }
}

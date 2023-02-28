import { sealUrl } from '@/utils/auth/seal'
import { NextRequest, NextResponse } from 'next/server'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  if (req.method !== 'GET') {
    return NextResponse.json({ error: 'Invalid request method.' }, { status: 400 })
  }
  return sealUrl(req)
}

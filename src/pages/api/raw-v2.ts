import { cors } from '@/utils/cors.web'
import handle from '@/utils/api/raw'
import { kv } from '@/utils/kv/edge'
import { NextRequest } from 'next/server'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  const response = await handle(kv, req)
  if (response.cors) {
    return await cors(req, response.toWeb())
  }
  return response.toWeb()
}

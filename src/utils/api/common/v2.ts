import { cors } from '@/utils/cors.web'
import { NextRequest } from 'next/server'
import { ReqHandler } from '.'

export function getHandler(handle: ReqHandler) {
  return async function handler(req: NextRequest) {
    const response = await handle(req)
    if (response.cors) {
      return await cors(req, response.toWeb())
    }
    return response.toWeb()
  }
}

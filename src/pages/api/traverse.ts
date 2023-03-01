import { NextRequest } from 'next/server'
import { traverseFolder } from '@/utils/od-api/traverseFolder'

export const config = {
  runtime: 'edge',
}

export default function handler(req: NextRequest) {
  const folder = req.nextUrl.searchParams.get('path')
  if (!folder) return new Response('No path specified', { status: 400 })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      for await (const item of await traverseFolder(encodeURIComponent(folder), Infinity)) {
        controller.enqueue(
          encoder.encode(`/${item.paths.map(decodeURIComponent).join('/')},${+item.folder},${item.size}\n`)
        )
      }
      controller.close()
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

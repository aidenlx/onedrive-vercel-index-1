/// <reference lib="webworker" />

export declare const self: ServiceWorkerGlobalScope

// @ts-expect-error - slience dev log
self.__WB_DISABLE_DEV_LOGS = true

import { downloadMultiple } from '../src/utils/download'

const isString = (f: FormDataEntryValue | null): f is string => typeof f === 'string'
const getString = (f: FormDataEntryValue | null) => (isString(f) ? f : undefined)

self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url)
  // This will intercept all request with a URL starting in /downloadZip/ ;
  // you should use a meaningful URL for each download, for example /downloadZip/invoices.zip
  const [, name] = url.pathname.match(/\/api\/batch\/(.+)/i) || [,]
  if (url.origin === self.origin && name) {
    if (name === 'keepalive') event.respondWith(new Response())
    else
      event.respondWith(
        (async () => {
          const form = await event.request.formData()
          const paths = form.getAll('path').filter(isString),
            rootFolder = getString(form.get('rootFolder'))
          return downloadMultiple(name, paths, rootFolder)
        })().catch(err => new Response(err instanceof Error ? err.message : JSON.stringify(err), { status: 500 }))
      )
  }
})

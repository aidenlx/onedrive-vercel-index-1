export function responseWithProgress(resp: Response, onProgress: (loaded: number, total: number) => void) {
  if (!resp.ok) {
    throw Error(resp.status + ' ' + resp.statusText)
  }

  if (!resp.body) {
    throw Error('ReadableStream not yet supported in this browser.')
  }
  const stream = resp.body

  // to access headers, server must send CORS header "Access-Control-Expose-Headers: content-encoding, content-length x-file-size"
  // server must send custom x-file-size header if gzip or other content-encoding is used
  // const contentEncoding = resp.headers.get('content-encoding')
  // const contentLength = resp.headers.get(contentEncoding ? 'x-file-size' : 'content-length')
  const contentLength = resp.headers.get('content-length')
  if (contentLength === null) {
    throw new Error('Response size header unavailable')
  }

  const total = parseInt(contentLength, 10)
  let loaded = 0

  return new Response(
    new ReadableStream({
      start(controller) {
        const reader = stream.getReader()
        read()
        function read() {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                controller.close()
                return
              }
              loaded += value.byteLength
              onProgress(loaded, total)
              controller.enqueue(value)
              read()
            })
            .catch(error => {
              console.error('error while reading stream', error)
              controller.error(error)
            })
        }
      },
    })
  )
}

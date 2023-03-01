'use client'

import toast from 'react-hot-toast'

import { useServiceWorker } from '@/utils/useServiceWorker'
import { useMemo } from 'react'
import { DownloadingToast } from '@/components/DownloadingToast'

// Blob download helper
function downloadFilesWithForm(name: string, paths: string[], rootFolder?: string) {
  const el = document.createElement('form')
  el.style.display = 'none'

  paths.forEach(p => {
    const input = document.createElement('input')
    input.value = p
    input.name = 'path'
    el.appendChild(input)
  })
  if (rootFolder) {
    const input = document.createElement('input')
    input.value = rootFolder
    input.name = 'root'
    el.appendChild(input)
  }
  el.method = 'post'
  el.action = `/api/batch/${name}`
  document.body.appendChild(el)
  el.submit()
  el.childNodes.forEach(c => c.remove())
  el.remove()
}

function respWithProgress(resp: Response, onProgress: (loaded: number, total: number) => void) {
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
              console.error(error)
              controller.error(error)
            })
        }
      },
    })
  )
}

export function useDownloadMultipleFiles(
  zipName: string
): (files: string[], rootFolder?: string, toastId?: string) => Promise<void> {
  const sw = useServiceWorker()
  return useMemo(() => {
    if (sw) {
      return async function downloadMultipleFiles(files, rootFolder = 'download.zip') {
        downloadFilesWithForm(zipName, files, rootFolder)
      }
    }
    return async function downloadMultipleFiles(files, rootFolder = 'download.zip', toastId) {
      const { downloadMultiple } = await import('@/utils/download')

      const blob = downloadMultiple(zipName, files, rootFolder)
        .then(resp =>
          toastId
            ? respWithProgress(resp, (loaded: number, total: number) =>
                toast.loading(
                  // TODO i18n
                  <DownloadingToast
                    progress={((loaded / total) * 100).toFixed(2)}
                    label={{ cancel: 'Cancel', progress: 'Downloading' }}
                  />,
                  { id: toastId }
                )
              )
            : resp
        )
        .then(r => r.blob())
      const { saveAs } = await import('file-saver')
      saveAs(await blob, zipName)
    }
  }, [sw, zipName])
}

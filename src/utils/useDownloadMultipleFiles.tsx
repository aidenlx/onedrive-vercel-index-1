'use client'

import toast from 'react-hot-toast'

import { useMemo } from 'react'
import { DownloadingToast, DownloadingToastLabels } from '@/components/DownloadingToast'
import { BatchDownload, useStore } from '@/components/page/store'

function batchDownloadWithForm(name: string, paths: string[], rootFolder?: string, size?: number | bigint) {
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
  if (size && size > 0) {
    const input = document.createElement('input')
    input.value = `${size}`
    input.name = 'size'
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
              console.error('error while reading stream', error)
              controller.error(error)
            })
        }
      },
    })
  )
}

export function useDownloadMultipleFiles(
  label: DownloadingToastLabels
): (zipFile: string, files: string[], rootFolder?: string, size?: number | bigint) => Promise<void> | void {
  const mode = useStore(s => s.batchDownload)
  return useMemo(() => {
    if (mode === BatchDownload.SW) {
      return batchDownloadWithForm
    } else if (mode === BatchDownload.Blob) {
      return async function batchDownloadWithBlob(zipFile, files, rootFolder, size) {
        const { downloadMultiple } = await import('@/utils/download')
        const toastId = toast.loading(<DownloadingToast label={label} />)

        try {
          const resp = downloadMultiple(zipFile, files, rootFolder, size).then(resp =>
            respWithProgress(resp, (loaded: number, total: number) =>
              toast.loading(<DownloadingToast progress={((loaded / total) * 100).toFixed(2)} label={label} />, {
                id: toastId,
              })
            )
          )
          const [{ saveAs }, blob] = await Promise.all([import('file-saver'), resp.then(r => r.blob())])
          saveAs(blob, zipFile)
          toast.success(label.dlDone, { id: toastId })
        } catch (error) {
          toast.error(label.dlFailed, { id: toastId })
        }
      }
    } else if (mode === BatchDownload.FS) {
      return async function batchDownloadWithFS(zipFile, files, rootFolder, size) {
        const { downloadMultiple } = await import('@/utils/download')
        const toastId = toast.loading(<DownloadingToast label={label} />)
        try {
          const fs = await showSaveFilePicker({
            suggestedName: zipFile,
            types: [{ accept: { 'application/zip': ['.zip'] } }],
          })

          const resp = downloadMultiple(zipFile, files, rootFolder, size).then(resp =>
            respWithProgress(resp, (loaded: number, total: number) =>
              toast.loading(<DownloadingToast progress={((loaded / total) * 100).toFixed(2)} label={label} />, {
                id: toastId,
              })
            )
          )
          const writer = await fs.createWritable({ keepExistingData: false })
          const [to, from] = await Promise.all([writer, resp.then(r => r.body)])
          await from?.pipeTo(to)
          toast.success(label.dlDone, { id: toastId })
        } catch (error) {
          toast.error(label.dlFailed, { id: toastId })
        }
      }
    }
    return () => void 0

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])
}

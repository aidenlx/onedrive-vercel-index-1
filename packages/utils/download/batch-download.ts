'use client'

/// <reference types="@types/wicg-file-system-access" />

import { batchDownloadWithForm } from './form-download'
import { responseWithProgress } from './progress-resp'

export enum BatchDownload {
  Blob,
  /** Service Worker + <form> sumbit */
  SW,
  /** File System Access API */
  FS,
}

const noop = () => void 0

export function getBatchDownloader(
  mode: BatchDownload,
  handlers: {
    onStart: () => void
    onProgress: (loaded: number, total: number) => void
    onComplete: () => void
    onError: (err: unknown) => void
  }
): (zipFile: string, files: string[], rootFolder?: string, size?: number | bigint) => Promise<void> | void {
  if (mode === BatchDownload.SW) {
    return batchDownloadWithForm
  } else if (mode === BatchDownload.Blob) {
    return async function batchDownloadWithBlob(zipFile, files, rootFolder, size) {
      const { downloadMultiple } = await import('./core')
      handlers.onStart()
      try {
        const resp = downloadMultiple(zipFile, files, rootFolder, size).then(resp =>
          responseWithProgress(resp, handlers.onProgress)
        )
        const [{ saveAs }, blob] = await Promise.all([import('file-saver'), resp.then(r => r.blob())])
        saveAs(blob, zipFile)
        handlers.onComplete()
      } catch (error) {
        handlers.onError(error)
      }
    }
  } else if (mode === BatchDownload.FS) {
    return async function batchDownloadWithFS(zipFile, files, rootFolder, size) {
      const { downloadMultiple } = await import('./core')
      handlers.onStart()
      try {
        const fs = await showSaveFilePicker({
          suggestedName: zipFile,
          types: [{ accept: { 'application/zip': ['.zip'] } }],
        })

        const resp = downloadMultiple(zipFile, files, rootFolder, size).then(resp =>
          responseWithProgress(resp, handlers.onProgress)
        )
        const writer = await fs.createWritable({ keepExistingData: false })
        const [to, from] = await Promise.all([writer, resp.then(r => r.body)])
        await from?.pipeTo(to)
        handlers.onComplete()
      } catch (error) {
        handlers.onError(error)
      }
    }
  }
  return noop
}

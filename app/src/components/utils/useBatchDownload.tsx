'use client'

import { getBatchDownloader } from '@od/util/download/batch-download'
import { DownloadingToast, DownloadingToastLabels } from '../DownloadingToast'
import { useStore } from '../store'
import { useMemo, useRef } from 'react'
import { toast } from 'react-hot-toast'

export function useBatchDownload(label: DownloadingToastLabels) {
  const mode = useStore(s => s.batchDownload)
  const toastIdRef = useRef<string>()
  return useMemo(
    () =>
      getBatchDownloader(mode, {
        onStart() {
          toastIdRef.current = toast.loading(<DownloadingToast label={label} />)
        },
        onProgress(loaded, total) {
          toast.loading(<DownloadingToast progress={((loaded / total) * 100).toFixed(2)} label={label} />, {
            id: toastIdRef.current,
          })
        },
        onComplete() {
          toast.success(label.dlDone, { id: toastIdRef.current })
        },
        onError() {
          toast.error(label.dlFailed, { id: toastIdRef.current })
        },
      }),
    [mode]
  )
}

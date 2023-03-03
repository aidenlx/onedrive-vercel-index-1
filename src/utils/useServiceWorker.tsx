'use client'
import { BatchDownload, useStore } from '@/components/page/store'
import { useEffect, useRef } from 'react'

import type { Workbox } from 'workbox-window'

declare global {
  interface Window {
    workbox: Workbox
  }
}

export function useServiceWorker() {
  const swRequested = useRef(false)
  const setMode = useStore(s => s.setBatchDownloadMode)
  useEffect(() => {
    if (swRequested.current || !('serviceWorker' in navigator)) return
    if ('showSaveFilePicker' in window) {
      setMode(BatchDownload.FS)
      return
    }
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    const safariVersion = parseFloat((/version\/([0-9]{1,}[.0-9]{0,})/i.exec(navigator.userAgent) || [])[1])
    // https://github.com/Touffy/client-zip#known-issues
    if (isSafari && safariVersion < 15.4) return
    swRequested.current = true
    navigator.serviceWorker
      .register('/api/sw.js', { scope: '/api/batch/' })
      .then(() => {
        setMode(BatchDownload.SW)
        console.log('batch download service worker registered')
      })
      .catch(err => console.error('error while register sw', err))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

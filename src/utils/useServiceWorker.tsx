'use client'
import { useEffect, useRef, useState } from 'react'

export function useServiceWorker() {
  const swRequested = useRef(false)
  const [swReady, setSwReady] = useState(false)
  useEffect(() => {
    if (swRequested.current) return
    if (!('serviceWorker' in navigator)) return
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    const safariVersion = parseFloat((/version\/([0-9]{1,}[.0-9]{0,})/i.exec(navigator.userAgent) || [])[1])
    // https://github.com/Touffy/client-zip#known-issues
    if (isSafari && safariVersion < 15.4) return
    swRequested.current = true
    navigator.serviceWorker
      .register('/assets/pwa/sw.js', { scope: '/api/batch/' })
      .then(() => {
        setSwReady(true)
        console.log('batch download service worker registered')
      })
      .catch(console.error)
  }, [])
  return swReady
}

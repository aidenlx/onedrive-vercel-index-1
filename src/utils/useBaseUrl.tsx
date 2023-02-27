import { useEffect, useState } from 'react'

/**
 * Extract the current web page's base url
 * @returns base url of the page
 */
export function useBaseUrl(): string {
  const [baseUrl, setBaseUrl] = useState('')
  useEffect(() => {
    setBaseUrl(getBaseUrl())
  }, [])

  return baseUrl
}

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return ''
}

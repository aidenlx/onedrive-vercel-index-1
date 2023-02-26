import { headers } from 'next/headers'

/**
 * Extract the current web page's base url
 * @returns base url of the page
 */
export function getBaseUrl(): string {
  const host = headers().get('host')
  if (!host) return ''
  if (host.startsWith('localhost')) return `http://${host}`
  return `https://${host}`
}

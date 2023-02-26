import { headers } from 'next/headers'

/**
 * Extract the current web page's base url
 * @returns base url of the page
 */
export function getBaseUrl(): string {
  const host = headers().get('host')
  if (!host) return ''
  if (host.startsWith('localhost')) {
    const port = host.split(':').pop()
    return `http://127.0.0.1${port ? `:${port}` : ''}`
  }
  return `https://${host}`
}

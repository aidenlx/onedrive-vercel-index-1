import { protectedPermlinkExpire } from '@cfg/site.config'
import useSWR from 'swr'
import { SealedPayload } from './const'
import { matchProtectedRoute } from './utils'

export function useSealedURL(path: string, ttl = protectedPermlinkExpire ?? 2 * 60 * 60 /** 2h */) {
  const isProtected = !!matchProtectedRoute(path)
  const { data, error, isLoading } = useSWR<SealedPayload>(isProtected ? '/api/seal' : null, async () => {
    const url = new URL('/api/seal', window.location.origin)
    url.searchParams.set('path', path)
    url.searchParams.set('ttl', ttl.toString())
    const res = await fetch(url)
    return await res.json()
  })
  return { payload: data?.payload, error, isLoading }
}

export function useIsProtected(path: string) {
  return !!matchProtectedRoute(path)
}

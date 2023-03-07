import useSWR from 'swr'
import { SealedPayload } from '../protect/const'
import { matchProtectedRoute } from '../protect/utils'
import { toPermLink } from '../permlink'
import { protectedMagiclinkExpire } from '@od/cfg/api'

/**
 * Generate magic link with authentication payload
 */
export default function useMagicLink(
  path: string,
  ttl = protectedMagiclinkExpire
): {
  payload?: string
  error: any
  isLoading: boolean
} {
  const route = matchProtectedRoute(path)
  const { data, error, isLoading } = useSWR<SealedPayload | undefined>(route ? '/api/seal' : null, async () => {
    if (!route) return undefined
    const url = new URL('/api/seal', window.location.origin)
    url.searchParams.set('route', route)
    url.searchParams.set('ttl', ttl.toString())
    const res = await fetch(url)
    return await res.json()
  })

  const payload = data?.payload ?? undefined
  return {
    payload,
    error,
    isLoading,
  }
}

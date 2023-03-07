import useSWR from 'swr'
import { AuthStatus } from '../protect/const'

export default function useUnlockedPaths() {
  const { data, mutate } = useSWR<AuthStatus>('/api/auth', () =>
    fetch('/api/auth', { method: 'GET' }).then(res => res.json())
  )
  return { data, mutate }
}

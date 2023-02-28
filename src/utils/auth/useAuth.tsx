import useSWR from 'swr'
import { AuthStatus } from './const'

export function useAuth() {
  const { data, mutate } = useSWR<AuthStatus>('/api/auth', () =>
    fetch('/api/auth', { method: 'GET' }).then(res => res.json())
  )
  return { data, mutate }
}

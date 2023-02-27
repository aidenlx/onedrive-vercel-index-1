import { useEffect, useState } from 'react'
import useSWR from 'swr'
import { AuthStatus } from './const'

export function useAuth() {
  const { data, mutate } = useSWR<AuthStatus>('/api/auth', () =>
    fetch('/api/auth', { method: 'GET' }).then(res => res.json())
  )
  return { data, mutate }
}

export function useCanCopy(path: string) {
  const { data } = useAuth()
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])

  return (isClient && data?.authenticated.every(r => !path.startsWith(r))) ?? true
}

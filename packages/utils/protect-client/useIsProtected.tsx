import { matchProtectedRoute } from '../protect/utils'

export default function useIsProtected(path: string) {
  return !!matchProtectedRoute(path)
}

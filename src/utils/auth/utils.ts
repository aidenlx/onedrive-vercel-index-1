import { protectedRoutes } from '@cfg/site.config'

/**
 * Match the specified route against a list of predefined routes
 * @param route directory path
 * @returns matched route or null
 */
export function matchProtectedRoute(path: string) {
  // match the longest route first
  for (const r of protectedRoutes.sort().reverse()) {
    // protected route array could be empty
    if (r && path.startsWith(r)) {
      return r
    }
  }
  return null
}

/**
 * Match protected routes in site config to get path to required auth token
 * @param path Path cleaned in advance
 * @returns Path to required auth token. If not required, return empty string.
 */

export function getAuthTokenPath(path: string) {
  // Ensure trailing slashes to compare paths component by component. Same for protectedRoutes.
  // Since OneDrive ignores case, lower case before comparing. Same for protectedRoutes.
  path = path.toLowerCase() + '/'
  let authTokenPath = ''
  for (let r of protectedRoutes) {
    if (typeof r !== 'string') continue
    r = r.toLowerCase().replace(/\/$/, '') + '/'
    if (path.startsWith(r)) {
      authTokenPath = `${r}.password`
      break
    }
  }
  return authTokenPath
}

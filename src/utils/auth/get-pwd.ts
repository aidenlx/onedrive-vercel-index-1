import { driveApi } from '@cfg/api.config'
import { encodePath, getAccessToken, getAuthTokenPath } from '../api/common'
import { kv } from '../kv/edge'

/**
 * @returns null if no `.password` file is found or file empty
 */
export async function getPassword(cleanPath: string): Promise<string | null> {
  const accessToken = await getAccessToken(kv)

  // Handle authentication through .password
  const authTokenPath = getAuthTokenPath(cleanPath)

  // Fetch password from remote file content
  if (authTokenPath === '') return null

  try {
    const url = new URL(`${driveApi}/root${encodePath(authTokenPath)}`)
    url.searchParams.append('select', '@microsoft.graph.downloadUrl,file')
    const { ['@microsoft.graph.downloadUrl']: downloadUrl } = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(res => (res.ok ? res.json() : Promise.reject(res)))

    const odProtectedToken = (await fetch(downloadUrl).then(res => (res.ok ? res.text() : Promise.reject(res)))).trim()
    return odProtectedToken ? odProtectedToken : null
  } catch (error) {
    if (error instanceof Response) {
      if (error.status === 404) {
        return null
      }
      throw new Error((await error.text()) ?? error.statusText)
    }
    throw error
  }
}

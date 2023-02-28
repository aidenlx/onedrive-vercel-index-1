import { getAccessToken } from '../api/common'
import { getAuthTokenPath } from './utils'
import { getDownloadLink } from '@/utils/od-api/getDownloadLink'
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
    const [downloadUrl] = await getDownloadLink(authTokenPath, accessToken, true)

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

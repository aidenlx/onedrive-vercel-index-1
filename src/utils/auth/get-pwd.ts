import { getDownloadLink } from '@/utils/od-api/getDownloadLink'
import { readResp } from '../od-api/fetchWithAuth'
import { getAuthTokenPath } from './utils'
/**
 * @returns null if no `.password` file is found or file empty
 */
export async function getPassword(cleanPath: string): Promise<string | null> {
  // Handle authentication through .password
  const authTokenPath = getAuthTokenPath(cleanPath)

  // Fetch password from remote file content
  if (authTokenPath === '') return null

  try {
    const [downloadUrl] = await getDownloadLink(authTokenPath, true)

    const odProtectedToken = (await fetch(downloadUrl).then(readResp('text'))).trim()
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

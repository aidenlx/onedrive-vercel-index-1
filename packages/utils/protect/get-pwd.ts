import getDownloadLink from '../graph-api/getDownload'
import { readResp } from '../graph-api/fetch'
import { getAuthTokenPath } from './utils'

/// <reference types="next" />

/**
 * get protected route password from `.password` file
 * @returns null if no `.password` file is found or file empty
 */
export default async function getRoutePassword(cleanPath: string): Promise<string | null> {
  // Handle authentication through .password
  const authTokenPath = getAuthTokenPath(cleanPath)

  // Fetch password from remote file content
  if (authTokenPath === '') return null

  try {
    const [downloadUrl] = await getDownloadLink(authTokenPath)

    const odProtectedToken = (await fetch(downloadUrl, { cache: 'no-cache' }).then(readResp('text'))).trim()
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

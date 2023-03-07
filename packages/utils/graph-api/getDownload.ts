import encodePath from './encodePath'
import { fetchWithAuth } from './fetch'
import getRequsetURL from './getRequestURL'

export default async function getDownload(path: string, base?: string) {
  // Handle response from OneDrive API
  const requestUrl = getRequsetURL(encodePath(path, base))
  // OneDrive international version fails when only selecting the downloadUrl (what a stupid bug)
  requestUrl.searchParams.append('select', 'id,size,@microsoft.graph.downloadUrl')
  /**
   * fetch Cache resource url for 1 hour
   * @see https://learn.microsoft.com/en-us/graph/api/resources/driveitem?view=graph-rest-1.0#instance-attributes
   */
  const {
    ['@microsoft.graph.downloadUrl']: downloadUrl,
    size,
    id,
  } = await fetchWithAuth(requestUrl, { method: 'GET', next: { revalidate: 3600 } }).then(res => res.json())
  return [downloadUrl as string, size as number, id as string] as const
}

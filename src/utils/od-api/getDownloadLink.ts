import { fetchWithAuth } from './fetchWithAuth'
import { getRequsetURL } from './odRequest'

export async function getDownloadLink(path: string) {
  // Handle response from OneDrive API
  const requestUrl = getRequsetURL(path)
  // OneDrive international version fails when only selecting the downloadUrl (what a stupid bug)
  requestUrl.searchParams.append('select', 'id,size,@microsoft.graph.downloadUrl')
  const {
    ['@microsoft.graph.downloadUrl']: downloadUrl,
    size,
    id,
  } = await fetchWithAuth(requestUrl, { method: 'GET' }).then(res => res.json())
  return [downloadUrl as string, size as number, id as string] as const
}

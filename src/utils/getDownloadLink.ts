import { driveApi } from '@cfg/api.config'
import { encodePath } from './api/common'

export async function getDownloadLink(cleanPath: string, accessToken: string) {
  // Handle response from OneDrive API
  const requestUrl = new URL(`${driveApi}/root${encodePath(cleanPath)}`)
  // OneDrive international version fails when only selecting the downloadUrl (what a stupid bug)
  requestUrl.searchParams.append('select', 'id,size,@microsoft.graph.downloadUrl')
  const {
    ['@microsoft.graph.downloadUrl']: downloadUrl,
    size,
    id,
  } = await fetch(requestUrl, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  }).then(res => (res.ok ? res.json() : Promise.reject(res)))
  return [downloadUrl as string, size as number, id as string] as const
}

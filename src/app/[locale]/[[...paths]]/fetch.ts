import 'server-only'

import { getAccessToken } from '@/utils/api/common'
import { Redis } from '@/utils/odAuthTokenStore'
import { resolveRoot } from '@/utils/path'
import { FileData, FolderData, select, DriveItem } from '@/utils/api/type'
import { getRequsetURL } from '@/utils/od-api/odRequest'
import { fetchWithAuth } from '@/utils/od-api/fetchWithAuth'
import { getChildren } from '@/utils/od-api/getChildren'

export async function getPageData(
  path = '',
  opts: Partial<{ sort: string }> & { kv: Redis }
): Promise<FileData | FolderData> {
  path = resolveRoot(path)

  async function get(url: URL | string) {
    if (url instanceof URL) url.searchParams.set('select', select.join(','))
    return await fetchWithAuth(url, { kv: opts.kv }).then(res => res.json())
  }

  const identityURL = getRequsetURL(path, false)
  // Querying current path identity (file or folder) and follow up query childrens in folder
  const identityData: DriveItem = await get(identityURL)

  if (!identityData.folder) return { type: 'file', value: identityData }

  const data = await getChildren(path, get)
  return {
    type: 'folder',
    value: data,
  }
}

/**
 * Extract next page token from full @odata.nextLink
 */
// function getSkipToken(data: Record<string, any>): string | null {
//   const nextLink = data['@odata.nextLink']
//   if (typeof nextLink !== 'string') return null
//   return nextLink.match(/&\$skiptoken=(.+)/i)?.[1] ?? null
// }

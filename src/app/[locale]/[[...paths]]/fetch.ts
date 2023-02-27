import 'server-only'

import { encodePath, getAccessToken } from '@/utils/api/common'
import { Redis } from '@/utils/odAuthTokenStore'
import { resolveRoot } from '@/utils/path'
import { driveApi } from '@cfg/api.config'
import { maxItems } from '@cfg/site.config'
import { FileData, FolderData, select, DriveItem } from '@/utils/api/type'

export async function getPageData(
  path = '',
  size = 0,
  opts: Partial<{ sort: string }> & { kv: Redis }
): Promise<FileData | FolderData> {
  path = resolveRoot(path)

  const accessToken = await getAccessToken(opts.kv)
  if (!accessToken) throw new NoAccessTokenError()

  const requestPath = encodePath(path, false),
    requestUrl = `${driveApi}/root${requestPath}`,
    isRoot = requestPath === ''

  async function get(url: URL | string, init: RequestInit = {}) {
    const requestUrl = typeof url === 'string' ? new URL(url) : url
    requestUrl.searchParams.set('select', select.join(','))
    return await fetch(requestUrl, {
      ...init,
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then(res => (res.ok ? res.json() : Promise.reject(res)))
  }

  // Querying current path identity (file or folder) and follow up query childrens in folder
  const identityData: DriveItem = await get(requestUrl)

  if (!identityData.folder) return { type: 'file', value: identityData }

  async function paginatedFetch(
    next: string | null = null,
    prevData: DriveItem[] = [],
    level = 0
  ): Promise<[data: DriveItem[], canLoadMore: boolean]> {
    const childUrl = new URL(`${requestUrl}${isRoot ? '' : ':'}/children`)
    childUrl.searchParams.set('$top', maxItems.toString())
    if (next) childUrl.searchParams.set('$skipToken', next)
    if (opts.sort) childUrl.searchParams.set('$orderby', opts.sort)

    const data: { value: DriveItem[] } = await get(childUrl)

    // reached the end of the collection
    if (data.value.length === 0 || (level > 0 && !next)) return [prevData, false]

    // load one more level to check if there is more data
    if (level >= size + 1) return [prevData, true]
    return await paginatedFetch(getSkipToken(data), [...prevData, ...data.value], level + 1)
  }

  const [data, canLoadMore] = await paginatedFetch()
  return {
    type: 'folder',
    value: data,
    canLoadMore,
  }
}

/**
 * Extract next page token from full @odata.nextLink
 */
function getSkipToken(data: Record<string, any>): string | null {
  const nextLink = data['@odata.nextLink']
  if (typeof nextLink !== 'string') return null
  return nextLink.match(/&\$skiptoken=(.+)/i)?.[1] ?? null
}

export class NoAccessTokenError extends Error {
  constructor() {
    super('No access token')
  }
}

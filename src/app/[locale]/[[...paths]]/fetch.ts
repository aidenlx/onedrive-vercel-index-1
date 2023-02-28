import 'server-only'

import { encodePath, getAccessToken } from '@/utils/api/common'
import { Redis } from '@/utils/odAuthTokenStore'
import { resolveRoot } from '@/utils/path'
import { driveApi } from '@cfg/api.config'
import { FileData, FolderData, select, DriveItem } from '@/utils/api/type'

export async function getPageData(
  path = '',
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

  async function* paginatedFetch() {
    const initial = new URL(`${requestUrl}${isRoot ? '' : ':'}/children`)
    initial.searchParams.set('select', select.join(','))

    let next: string | undefined = initial.href
    do {
      const data: { value: DriveItem[]; '@odata.nextLink'?: string } = await fetch(next, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).then(res => (res.ok ? res.json() : Promise.reject(res)))
      yield* data.value
      next = data['@odata.nextLink']
    } while (next)
  }

  const data = await ArrayAsyncFrom(paginatedFetch())
  return {
    type: 'folder',
    value: data,
  }
}

async function ArrayAsyncFrom<T>(iter: AsyncIterable<T>) {
  const arr: Awaited<T>[] = []
  for await (const item of iter) {
    arr.push(item)
  }
  return arr
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

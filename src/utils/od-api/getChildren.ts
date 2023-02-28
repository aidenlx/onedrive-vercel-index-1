import { DriveItem } from '@/utils/api/type'
import { arrayAsyncFrom } from '@/utils/arrayAsyncFrom'
import { getRequsetURL } from './odRequest'

export async function getChildren<Item = DriveItem>(path: string, fetch: (url: URL | string) => Promise<any>) {
  async function* paginatedFetchChildren() {
    const initial = getRequsetURL(path, false, 'children')
    let next: string | undefined = initial.href
    do {
      const data: { value: Item[]; '@odata.nextLink'?: string } = await fetch(next)
      yield* data.value
      next = data['@odata.nextLink']
    } while (next)
  }

  const data = await arrayAsyncFrom(paginatedFetchChildren())

  return data
}

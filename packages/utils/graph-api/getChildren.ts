import { DriveItem } from './type'
import asyncArrayFrom from '../asyncFrom'
import getRequsetURL from './getRequestURL'
import encodePath from './encodePath'

export default async function getChildren<Item = DriveItem>(path: string, fetch: (url: URL | string) => Promise<any>) {
  async function* paginatedFetchChildren() {
    const initial = getRequsetURL(encodePath(path), 'children')
    let next: string | undefined = initial.href
    do {
      const data: { value: Item[]; '@odata.nextLink'?: string } = await fetch(next)
      yield* data.value
      next = data['@odata.nextLink']
    } while (next)
  }

  const data = await asyncArrayFrom(paginatedFetchChildren())

  return data
}

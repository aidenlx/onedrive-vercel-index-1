import pLimit from 'p-limit'
import { DriveItem } from '../api/type'
import { fetchWithAuth } from './fetchWithAuth'
import { getChildren } from './getChildren'

export async function traverseFolder(path = '/') {
  const limit = pLimit(5)
  async function fetchChildren(path: string) {
    return await limit(async () => {
      const children = await getChildren<Pick<DriveItem, 'name' | 'folder'>>(path, async (url: URL | string) => {
        if (url instanceof URL) url.searchParams.set('select', ['name', 'folder'].join(','))
        return await fetchWithAuth(url).then(res => res.json())
      })
      // console.log('children of ' + path, children.length)
      return children
    })
  }

  async function* traverse(paths: string[]): AsyncGenerator<string[]> {
    yield paths

    const directChildren = await fetchChildren(paths.join('/'))
    const files = directChildren.filter(child => !child.folder)
    const folders = directChildren.filter(child => child.folder)
    for (const child of files) {
      yield [...paths, child.name]
    }
    for (const child of folders) {
      yield* traverse([...paths, child.name])
    }
  }
  return traverse(path.split('/').filter(Boolean))
}

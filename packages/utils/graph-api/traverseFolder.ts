import pLimit from 'p-limit'
import { DriveItem } from './type'
import { fetchWithAuth } from './fetch'
import getChildren from './getChildren'

/**
 * @param path accept url encoded path
 * @returns url encoded paths
 */
export default async function traverseFolder(path = '/', level = 0) {
  const limit = pLimit(5)
  async function fetchChildren(path: string) {
    return await limit(async () => {
      const children = await getChildren<Pick<DriveItem, 'name' | 'folder' | 'size'>>(
        path,
        async (url: URL | string) => {
          if (url instanceof URL) url.searchParams.set('select', ['name', 'folder', 'size'].join(','))
          return await fetchWithAuth(url).then(res => res.json())
        }
      )
      // console.log('children of ' + path, children.length)
      return children
    })
  }

  async function* traverse(
    paths: string[],
    myLevel: number
  ): AsyncGenerator<{ paths: string[]; folder: boolean; size: number }> {
    yield { paths, folder: true, size: -1 }

    const directChildren = await fetchChildren(paths.join('/'))
    const files = directChildren.filter(child => !child.folder)
    const folders = directChildren.filter(child => child.folder)
    for (const child of files) {
      yield { paths: [...paths, child.name], folder: false, size: child.size }
    }
    if (myLevel >= level) return
    for (const child of folders) {
      yield* traverse([...paths, child.name], myLevel + 1)
    }
  }
  return traverse(path.split('/').filter(Boolean), 0)
}

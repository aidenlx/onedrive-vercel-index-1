import { driveApi } from '@cfg/api.config'

export function getRequsetURL(path: string, apiEntry: string[] | string = '') {
  const requestPath = encodePath(path)
  if (Array.isArray(apiEntry)) {
    apiEntry = apiEntry.join('/')
  }
  apiEntry = resolveRoot(apiEntry)
  apiEntry = encodeURI(apiEntry)

  if (requestPath === '') {
    return new URL(`${driveApi}/root${apiEntry}`)
  } else {
    return new URL(`${driveApi}/root${requestPath}:${apiEntry}`)
  }
}

import { baseDirectory } from '@cfg/site.config'
import { join, resolveRoot } from '@/utils/path'

const basePath = resolveRoot(baseDirectory)

/**
 * Encode the path of the file relative to the base directory
 *
 * @param path Relative path of the file to the base directory
 * @returns Absolute path of the file inside OneDrive
 */

function encodePath(path: string): string {
  path = join(basePath, path)
  if (path === '/') return ''
  path = path.replace(/\/$/, '')
  return `:${encodeURI(path)}`
}

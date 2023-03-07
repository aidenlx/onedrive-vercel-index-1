/**
 * Encode the path of the file to be used in graph API pathname
 * @param path Relative path of the file to the base directory
 */

import { join, resolveRoot } from '../path'
import { baseDirectory } from '@od/cfg/api'

export default function encodePath(path: string, base = resolveRoot(baseDirectory)): string {
  path = join(base, path)
  if (path === '/') return ''
  path = path.replace(/\/$/, '')
  return `:${encodeURI(path)}`
}

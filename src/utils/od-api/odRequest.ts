import { driveApi } from '@/../config/api.config'
import { encodePath } from '../api/common'

export function getRequsetURL(cleanPath: string, urlEncodePath: boolean, entry: string[] | string = '') {
  const requestPath = encodePath(cleanPath, urlEncodePath)
  if (Array.isArray(entry)) {
    entry = entry.join('/')
  }
  const isRoot = requestPath === ''
  const entrypoint = entry ? `${isRoot ? '' : ':'}/${entry}` : '',
    requestUrl = `${driveApi}/root${requestPath}${entrypoint}`

  return new URL(requestUrl)
}



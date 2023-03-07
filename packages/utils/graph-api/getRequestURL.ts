import { driveApi } from '@od/cfg/api'
import { resolveRoot } from '../path'

export default function getRequsetURL(encodedPath: string, apiEntry: string[] | string = '') {
  if (Array.isArray(apiEntry)) {
    apiEntry = apiEntry.join('/')
  }
  apiEntry = resolveRoot(apiEntry)
  apiEntry = encodeURI(apiEntry)

  if (encodedPath === '') {
    return new URL(`${driveApi}/root${apiEntry}`)
  } else {
    return new URL(`${driveApi}/root${encodedPath}:${apiEntry}`)
  }
}

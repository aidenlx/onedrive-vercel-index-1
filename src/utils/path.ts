import { resolve, normalize, join as _join } from 'path-browserify'

/**
 * normalizing and making absolute, trailing slashes are trimmed
 */
export function resolveRoot(path: string) {
  return resolve('/', normalize(path)).replace(/\/$/, '')
}

export function join(...paths: string[]) {
  return _join(...paths)
}

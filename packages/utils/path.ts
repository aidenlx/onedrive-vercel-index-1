/**
 * normalizing and making absolute, trailing slashes are trimmed
 */
export function resolveRoot(path: string) {
  return '/' + path.replace(/\\/g, '/').replace(/^\/+|\/+$/, '')
}

export function join(...paths: string[]) {
  return paths.join('/').replace(/\/+/g, '/')
}

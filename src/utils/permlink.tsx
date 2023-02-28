import { getReadablePath } from '@/utils/getReadablePath'

export function permLinkParams(path: string, hashedToken?: string | null, readable = true) {
  if (readable) {
    path = getReadablePath(path)
  }
  return `path=${path}`
}

export function toPermLink(path: string, hashedToken?: string | null, readable = true) {
  return `/api/raw/?${permLinkParams(path, hashedToken, readable)}`
}
export function toCustomisedPermLink(name: string, path: string, hashedToken?: string | null, readable = true) {
  return `/api/name/${name}?${permLinkParams(path, hashedToken, readable)}`
}

export function permLinkFromParams(params: string) {
  return `/api/raw/?${params}`
}
export function customisedPermLinkFromParams(name: string, params: string) {
  return `/api/name/${name}?${params}`
}

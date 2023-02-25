import { DriveItem } from '@/utils/api/type'
import emojiRegex from 'emoji-regex'

/**
 * Convert url query into path string
 *
 * @param query Url query property
 * @returns Path string
 */
export const queryToPath = (paths?: string[]) => {
  // already url-encoded in page.js props
  if (!paths) return '/'
  if (typeof paths === 'string') return `/${paths}`
  return `/${paths.join('/')}`
}

export const emojiPattern = emojiRegex()
// Render the icon of a folder child (may be a file or a folder), use emoji if the name of the child contains emoji
export const renderEmoji = (name: string) => {
  const emoji = emojiPattern.exec(name)
  return { render: emoji && !emoji.index, emoji }
}

export const itemPathGetter = (path: string) =>
  function getItemPath(name: string) {
    return `${path === '/' ? '' : path}/${encodeURIComponent(name)}`
  }

export const getFiles = (folderChildren: DriveItem[]) => folderChildren.filter(c => !c.folder && c.name !== '.password')

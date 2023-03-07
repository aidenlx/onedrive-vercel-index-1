import { DriveItem } from '@od/util/graph-api/type'
import { join, resolveRoot } from '@od/util/path'
import emojiRegex from 'emoji-regex'

/**
 * @returns absolute path `/` or `/path/to/file`
 */
export function getPathFromSegments(paths: string[] = []) {
  return '/' + paths.map(decodeURIComponent).join('/')
}

export const emojiPattern = emojiRegex()
// Render the icon of a folder child (may be a file or a folder), use emoji if the name of the child contains emoji
export const renderEmoji = (name: string) => {
  const emoji = emojiPattern.exec(name)
  return { render: emoji && !emoji.index, emoji }
}

export const itemPathGetter = (parent: string) =>
  function getItemPath(name: string) {
    return resolveRoot(join(parent, name))
  }

export const getFiles = (folderChildren: DriveItem[]) => folderChildren.filter(c => !c.folder && c.name !== '.password')

import { DriveItem as _DriveItem } from '@microsoft/microsoft-graph-types'

export const select = ['name', 'size', 'id', 'lastModifiedDateTime', 'folder', 'file', 'video', 'image'] as const
export type DriveItem = {
  [key in (typeof select)[number]]: Exclude<_DriveItem[key], null | undefined>
}

export interface FileData {
  type: 'file'
  value: DriveItem
}
export interface FolderData {
  type: 'folder'
  value: DriveItem[]
}

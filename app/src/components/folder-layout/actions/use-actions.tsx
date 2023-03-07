import type { BatchActionLabels } from './BatchAction'
import type { FolderActionLabels } from './FolderAction'
import type { FileActionLabels } from './FileAction'
import type { ItemSelectionLabels } from './ItemSelection'
import { useTranslations } from 'next-intl'
import { DownloadingToastLabels } from '@ui/DownloadingToast'

export const totalGeneratingID = '__TOTAL__'

export function useBatchActionLabels(): BatchActionLabels & DownloadingToastLabels {
  const t = useTranslations('folder.actions')
  const tDownload = useTranslations('downloadToast')
  return {
    copySelected: t('Copy selected files permalink'),
    cpSelectedDone: t('Copied selected files permalink'),
    selectAll: t('Select files'),
    downloadSelected: t('Download selected files'),
    dlSelectedPending: t('Downloading selected files, refresh page to cancel'),
    dlProgress: tDownload('Downloading selected files'),
    dlDone: tDownload('Finished downloading selected files'),
    dlFailed: tDownload('Failed to download selected files'),
    dlCancel: tDownload('Cancel'),
  }
}
export function useFolderActionLabels(): FolderActionLabels & DownloadingToastLabels {
  const t = useTranslations('folder.actions')
  const tDownload = useTranslations('downloadToast')
  return {
    copyFolder: t('Copy folder permalink'),
    cpFolderDone: t('Copied folder permalink'),
    dlFolderPending: t('Downloading folder, refresh page to cancel'),
    downloadFolder: t('Download folder'),
    dlProgress: tDownload('Downloading selected folder'),
    dlDone: tDownload('Finished downloading folder'),
    dlFailed: tDownload('Failed to download folder'),
    dlCancel: tDownload('Cancel'),
  }
}
export function useFileActionLabels(): FileActionLabels {
  const t = useTranslations('folder.actions')
  return {
    copyFile: t('Copy raw file permalink'),
    cpFileDone: t('Copied raw file permalink'),
    downloadFile: t('Download file'),
  }
}
export function useItemSelectionLabels(): ItemSelectionLabels {
  const t = useTranslations('folder.actions')
  return {
    selectFile: t('Select file'),
  }
}

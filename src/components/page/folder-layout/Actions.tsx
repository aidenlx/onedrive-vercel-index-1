'use client'

import { DriveItem } from '@/utils/api/type'
import { getBaseUrl } from '@/utils/getBaseUrl'
import { useStoredToken } from '@/utils/useStoredToken'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { totalSelectState, useStore } from '../store'
import { getFiles, itemPathGetter } from '../utils'
import { toPermLink } from "@/utils/permlink"
import Checkbox from './Checkbox'
import Downloading from './Downloading'
import { useClipboard } from 'use-clipboard-copy'
import toast from 'react-hot-toast'
import { useEffect } from 'react'
// import {
//   DownloadingToast,
//   downloadMultipleFiles,
//   downloadTreelikeMultipleFiles,
//   traverseFolder,
// } from '@/components/MultiFileDownloader'

const totalGeneratingID = '__TOTAL__'

export type ActionLabels = FileActionLabels & FolderActionLabels & BatchActionLabels & ItemSelectionLabels

export interface BatchActionLabels {
  copySelected: string
  cpSelectedDone: string
  downloadSelected: string
  dlSelectedPending: string
  selectAll: string
}

export function BatchAction({
  folderChildren,
  label,
  path,
}: {
  folderChildren: DriveItem[]
  path: string
  label: BatchActionLabels
}) {
  const totalSelected = useStore(totalSelectState),
    toggleTotalSelected = useStore(s => s.toggleSelectAll),
    totalGenerating = useStore(s => s.folderGenerating.has(totalGeneratingID)),
    selected = useStore(s => s.selected),
    updateItems = useStore(s => s.updateItems)

  useEffect(() => {
    updateItems(folderChildren.map(v => v.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderChildren])

  const clipboard = useClipboard()
  const getItemPath = itemPathGetter(path)
  const hashedToken = useStoredToken(path)


  return (
    <>
      <Checkbox checked={totalSelected} onChange={toggleTotalSelected} indeterminate={true} title={label.selectAll} />
      <button
        title={label.copySelected}
        className="cursor-pointer rounded p-1.5 hover:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-white dark:hover:bg-gray-600 disabled:dark:text-gray-600 disabled:hover:dark:bg-gray-900"
        disabled={totalSelected === 0}
        onClick={() => {
          clipboard.copy(
            getFiles(folderChildren)
              .filter(v => selected.has(v.name))
              .map(v => toPermLink(getItemPath(v.name), hashedToken))
              .join('\n')
          )
          toast.success(label.cpSelectedDone)
        }}
      >
        <FontAwesomeIcon icon={['far', 'copy']} size="lg" />
      </button>
      {totalGenerating ? (
        <Downloading title={label.dlSelectedPending} style="p-1.5" />
      ) : (
        <button
          title={label.downloadSelected}
          className="cursor-pointer rounded p-1.5 hover:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-white dark:hover:bg-gray-600 disabled:dark:text-gray-600 disabled:hover:dark:bg-gray-900"
          disabled={totalSelected === 0}
          onClick={() => {
            throw new Error('not implemented')
            // handleSelectedDownload()
          }}
        >
          <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} size="lg" />
        </button>
      )}
    </>
  )
}

export interface FolderActionLabels {
  copyFolder: string
  cpFolderDone: string
  downloadFolder: string
  dlFolderPending: string
}

export function FolderAction({ c, label, path }: { c: DriveItem; path: string; label: FolderActionLabels }) {
  const getItemPath = itemPathGetter(path)
  const folderGenerating = useStore(s => s.folderGenerating.has(c.id))
  const clipboard = useClipboard()

  return (
    <>
      <span
        title={label.copyFolder}
        className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
        onClick={() => {
          clipboard.copy(`${getBaseUrl()}${getItemPath(c.name)}`)
          toast(label.cpFolderDone, { icon: '👌' })
        }}
      >
        <FontAwesomeIcon icon={['far', 'copy']} />
      </span>
      {folderGenerating ? (
        <Downloading title={label.dlFolderPending} style="px-1.5 py-1" />
      ) : (
        <span
          title={label.downloadFolder}
          className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
          onClick={() => {
            throw new Error('not implemented')
            // handleFolderDownload(getItemPath(c.name), c.id, c.name)()
          }}
        >
          <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} />
        </span>
      )}
    </>
  )
}



export interface FileActionLabels {
  copyFile: string
  cpFileDone: string
  downloadFile: string
}

export function FileAction({ c, label, path }: { c: DriveItem; path: string; label: FileActionLabels }) {
  const hashedToken = useStoredToken(path)
  const getItemPath = itemPathGetter(path)
  const clipboard = useClipboard()

  const permlink = toPermLink(getItemPath(c.name), hashedToken)

  return (
    <>
      <span
        title={label.copyFile}
        className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
        onClick={() => {
          clipboard.copy(permlink)
          toast.success(label.cpFileDone)
        }}
      >
        <FontAwesomeIcon icon={['far', 'copy']} />
      </span>
      <a
        title={label.downloadFile}
        className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
        href={permlink}
      >
        <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} />
      </a>
    </>
  )
}

function ItemSelection({ c, label, className }: { c: DriveItem; label: { selectFile: string }; className?: string }) {
  const selected = useStore(s => s.selected.get(c.id)),
    toggleItemSelected = useStore(s => s.toggleSelected)

  return (
    <div className={className}>
      {!c.folder && !(c.name === '.password') && (
        <Checkbox checked={selected ? 2 : 0} onChange={() => toggleItemSelected(c.id)} title={label.selectFile} />
      )}
    </div>
  )
}

export interface ItemSelectionLabels {
  selectFile: string
}

export function ItemSelectionList(props: { c: DriveItem; label: ItemSelectionLabels }) {
  return <ItemSelection {...props} className="hidden p-1.5 text-gray-700 dark:text-gray-400 md:flex" />
}
export function ItemSelectionGrid(props: { c: DriveItem; label: { selectFile: string } }) {
  const selected = useStore(s => s.selected.get(props.c.id))

  return (
    <ItemSelection
      {...props}
      className={`${
        selected ? 'opacity-100' : 'opacity-0'
      } absolute top-0 left-0 z-10 m-1 rounded bg-white/50 py-0.5 group-hover:opacity-100 dark:bg-gray-900/50`}
    />
  )
}

//   const files = getFiles()
// .filter(c => selected[c.id])
// .map(c => ({
//   name: c.name,
//   url: `/api/raw/?path=${path}/${encodeURIComponent(c.name)}${hashedToken ? `&odpt=${hashedToken}` : ''}`,
// }))

// Selected file download
// const handleSelectedDownload = (path: string, files: Record<'name' | 'url', string>[]) => {
//   const folderName = path.substring(path.lastIndexOf('/') + 1)
//   const folder = folderName ? decodeURIComponent(folderName) : undefined

//   if (files.length == 1) {
//     const el = document.createElement('a')
//     el.style.display = 'none'
//     document.body.appendChild(el)
//     el.href = files[0].url
//     el.click()
//     el.remove()
//   } else if (files.length > 1) {
//     setTotalGenerating(true)
//     // TODO i18n
//     const toastId = toast.loading(<DownloadingToast label={{ cancel: 'Cancel', progress: 'Downloading' }} />)
//     downloadMultipleFiles({ toastId, files, folder })
//       .then(() => {
//         setTotalGenerating(false)
//         toast.success(t('Finished downloading selected files.'), {
//           id: toastId,
//         })
//       })
//       .catch(() => {
//         setTotalGenerating(false)
//         toast.error(t('Failed to download selected files.'), { id: toastId })
//       })
//   }
// }

// Folder recursive download
// const handleFolderDownload = (path: string, id: string, name?: string) => () => {
//   const files = (async function* () {
//     for await (const { meta: c, path: p, isFolder, error } of traverseFolder(path)) {
//       if (error) {
//         toast.error(
//           t('Failed to download folder {{path}}: {{status}} {{message}} Skipped it to continue.', {
//             path: p,
//             status: error.status,
//             message: error.message,
//           })
//         )
//         continue
//       }
//       const hashedTokenForPath = getStoredToken(p)
//       yield {
//         name: c?.name,
//         url: `/api/raw/?path=${p}${hashedTokenForPath ? `&odpt=${hashedTokenForPath}` : ''}`,
//         path: p,
//         isFolder,
//       }
//     }
//   })()

//   setFolderGenerating({ ...folderGenerating, [id]: true })
//   const toastId = toast.loading(<DownloadingToast router={router} />)

//   downloadTreelikeMultipleFiles({ toastId, files, basePath: path, folder: name })
//     .then(() => {
//       setFolderGenerating({ ...folderGenerating, [id]: false })
//       toast.success(t('Finished downloading folder.'), { id: toastId })
//     })
//     .catch(() => {
//       setFolderGenerating({ ...folderGenerating, [id]: false })
//       toast.error(t('Failed to download folder.'), { id: toastId })
//     })
// }

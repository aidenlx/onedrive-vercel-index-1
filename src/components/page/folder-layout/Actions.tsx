'use client'

import { DriveItem } from '@/utils/api/type'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { totalSelectState, useStore } from '../store'
import { getFiles, itemPathGetter } from '../utils'
import { toPermLink } from '@/utils/permlink'
import { usePermLink } from '@/utils/usePermLink'
import Checkbox from './Checkbox'
import Downloading from './Downloading'
import { useClipboard } from 'use-clipboard-copy'
import toast from 'react-hot-toast'
import { useEffect } from 'react'
import { faArrowAltCircleDown, faCopy } from '@fortawesome/free-regular-svg-icons'
import { useSealedURL } from '@/utils/auth/useSeal'
import { DownloadingToastLabels } from '@/components/DownloadingToast'
import { useDownloadMultipleFiles } from '@/utils/useDownloadMultipleFiles'
import { JustMeta, predictLength } from 'client-zip'

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
  label: BatchActionLabels & DownloadingToastLabels
}) {
  const totalSelected = useStore(totalSelectState),
    toggleTotalSelected = useStore(s => s.toggleSelectAll),
    totalGenerating = useStore(s => s.folderGenerating.has(totalGeneratingID)),
    selected = useStore(s => s.selected),
    updateItems = useStore(s => s.updateItems)

  const setFolderGenerating = useStore(s => s.setFolderGenerating)
  const setfolderGenerated = useStore(s => s.setfolderGenerated)

  useEffect(() => {
    updateItems(getFiles(folderChildren).map(v => v.id))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderChildren])

  const { payload, error, isLoading } = useSealedURL(path)

  const clipboard = useClipboard()
  const getItemPath = itemPathGetter(path)

  const downloadMultiple = useDownloadMultipleFiles(label)

  async function handleSelectedDownload() {
    setFolderGenerating(totalGeneratingID)
    const folderName = path.substring(path.lastIndexOf('/') + 1)
    const folder = folderName ? decodeURIComponent(folderName) : undefined
    const files = folderChildren.filter(v => selected.get(v.id)).map(v => getItemPath(v.name))
    if (files.length === 1) {
      window.open(toPermLink(files[0]))
    } else if (files.length > 1) {
      await downloadMultiple(folderName ? `${folderName}.zip` : 'download.zip', files, folder)
    }
    setfolderGenerated(totalGeneratingID)
  }

  return (
    <>
      <Checkbox checked={totalSelected} onChange={toggleTotalSelected} indeterminate={true} title={label.selectAll} />
      <button
        title={label.copySelected}
        className="cursor-pointer rounded p-1.5 hover:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-white dark:hover:bg-gray-600 disabled:dark:text-gray-600 disabled:hover:dark:bg-gray-900"
        disabled={error || isLoading || totalSelected === 0}
        onClick={() => {
          clipboard.copy(
            folderChildren
              .filter(v => selected.get(v.id))
              .map(v => new URL(toPermLink(getItemPath(v.name), payload), window.location.origin).href)
              .join('\n')
          )
          toast.success(label.cpSelectedDone)
        }}
      >
        <FontAwesomeIcon icon={faCopy} size="lg" />
      </button>
      {totalGenerating ? (
        <Downloading title={label.dlSelectedPending} style="p-1.5" />
      ) : (
        <button
          title={label.downloadSelected}
          className="cursor-pointer rounded p-1.5 hover:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-white dark:hover:bg-gray-600 disabled:dark:text-gray-600 disabled:hover:dark:bg-gray-900"
          disabled={totalSelected === 0}
          onClick={handleSelectedDownload}
        >
          <FontAwesomeIcon icon={faArrowAltCircleDown} size="lg" />
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

export function FolderAction({
  c,
  label,
  path,
}: {
  c: DriveItem
  path: string
  label: FolderActionLabels & DownloadingToastLabels
}) {
  const getItemPath = itemPathGetter(path)
  const isGenFolder = useStore(s => s.folderGenerating.has(c.id))
  const setFolderGenerating = useStore(s => s.setFolderGenerating)
  const setfolderGenerated = useStore(s => s.setfolderGenerated)
  const clipboard = useClipboard()

  const downloadMultiple = useDownloadMultipleFiles(label)

  async function handleFolderDownload() {
    setFolderGenerating(c.id)
    const url = new URL(`/api/traverse?path=${getItemPath(c.name)}`, window.location.origin)
    const files = await fetch(url)
      .then(r => r.text())
      .then(csv => {
        return csv.split('\n').flatMap(v => {
          const [path, folder, size] = v.split(',')
          return folder === '0' ? [{ name: path, size: parseInt(size, 10) }] : []
        })
      })
    await downloadMultiple(
      `${c.name}.zip`,
      files.map(v => encodeURIComponent(v.name)),
      c.name,
      predictLength(files)
    )
    setfolderGenerated(c.id)
  }

  return (
    <>
      <span
        title={label.copyFolder}
        className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
        onClick={() => {
          clipboard.copy(new URL(getItemPath(c.name), window.location.origin).href)
          toast(label.cpFolderDone, { icon: '👌' })
        }}
      >
        <FontAwesomeIcon icon={faCopy} />
      </span>
      {isGenFolder ? (
        <Downloading title={label.dlFolderPending} style="px-1.5 py-1" />
      ) : (
        <span
          title={label.downloadFolder}
          className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
          onClick={handleFolderDownload}
        >
          <FontAwesomeIcon icon={faArrowAltCircleDown} />
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
  const getItemPath = itemPathGetter(path)
  const clipboard = useClipboard()

  const { payload, error, isLoading } = useSealedURL(path)
  const permlink = usePermLink(getItemPath(c.name), payload)

  return (
    <>
      <button
        title={label.copyFile}
        className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-white dark:hover:bg-gray-600 "
        disabled={error || isLoading}
        onClick={() => {
          clipboard.copy(new URL(permlink, window.location.origin).href)
          toast.success(label.cpFileDone)
        }}
      >
        <FontAwesomeIcon icon={faCopy} />
      </button>
      <a
        title={label.downloadFile}
        className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
        href={permlink}
      >
        <FontAwesomeIcon icon={faArrowAltCircleDown} />
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

'use client'
import { DriveItem } from '@od/util/graph-api/type'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { totalSelectState, useStore } from '@ui/store'
import { getFiles, itemPathGetter } from '@ui/utils/page'
import { toPermLink } from '@od/util/permlink'
import Checkbox from '../Checkbox'
import Downloading from '../Downloading'
import { useClipboard } from 'use-clipboard-copy'
import toast from 'react-hot-toast'
import { useEffect } from 'react'
import { faArrowAltCircleDown, faCopy } from '@fortawesome/free-regular-svg-icons'
import { useMagicLink } from '@od/util/protect-client'
import { DownloadingToastLabels } from '@ui/DownloadingToast'
import { totalGeneratingID } from './use-actions'
import { getBatchDownloader } from '@od/util/download/batch-download'
import { useBatchDownload } from '@/components/utils/useBatchDownload'

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

  const { payload, error, isLoading } = useMagicLink(path)

  const clipboard = useClipboard()
  const getItemPath = itemPathGetter(path)

  const downloadMultiple = useBatchDownload(label)

  async function handleSelectedDownload() {
    setFolderGenerating(totalGeneratingID)
    const folder = path.split('/').pop()
    const files = folderChildren.filter(v => selected.get(v.id)).map(v => getItemPath(v.name))
    if (files.length === 1) {
      window.open(toPermLink(files[0]))
    } else if (files.length > 1) {
      await downloadMultiple(folder ? `${folder}.zip` : 'download.zip', files, folder)
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

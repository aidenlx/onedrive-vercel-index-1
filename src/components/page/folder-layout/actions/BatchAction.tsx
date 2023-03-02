'use client';
import { DriveItem } from '@/utils/api/type';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { totalSelectState, useStore } from '../../store';
import { getFiles, itemPathGetter } from '../../utils';
import { toPermLink } from '@/utils/permlink';
import Checkbox from '../Checkbox';
import Downloading from '../Downloading';
import { useClipboard } from 'use-clipboard-copy';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import { faArrowAltCircleDown, faCopy } from '@fortawesome/free-regular-svg-icons';
import { useSealedURL } from '@/utils/auth/useSeal';
import { DownloadingToastLabels } from '@/components/DownloadingToast';
import { useDownloadMultipleFiles } from '@/utils/useDownloadMultipleFiles';
import { totalGeneratingID } from './use-actions';


export interface BatchActionLabels {
  copySelected: string;
  cpSelectedDone: string;
  downloadSelected: string;
  dlSelectedPending: string;
  selectAll: string;
}

export function BatchAction({
  folderChildren, label, path,
}: {
  folderChildren: DriveItem[];
  path: string;
  label: BatchActionLabels & DownloadingToastLabels;
}) {
  const totalSelected = useStore(totalSelectState), toggleTotalSelected = useStore(s => s.toggleSelectAll), totalGenerating = useStore(s => s.folderGenerating.has(totalGeneratingID)), selected = useStore(s => s.selected), updateItems = useStore(s => s.updateItems);

  const setFolderGenerating = useStore(s => s.setFolderGenerating);
  const setfolderGenerated = useStore(s => s.setfolderGenerated);

  useEffect(() => {
    updateItems(getFiles(folderChildren).map(v => v.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderChildren]);

  const { payload, error, isLoading } = useSealedURL(path);

  const clipboard = useClipboard();
  const getItemPath = itemPathGetter(path);

  const downloadMultiple = useDownloadMultipleFiles(label);

  async function handleSelectedDownload() {
    setFolderGenerating(totalGeneratingID);
    const folderName = path.substring(path.lastIndexOf('/') + 1);
    const folder = folderName ? decodeURIComponent(folderName) : undefined;
    const files = folderChildren.filter(v => selected.get(v.id)).map(v => getItemPath(v.name));
    if (files.length === 1) {
      window.open(toPermLink(files[0]));
    } else if (files.length > 1) {
      await downloadMultiple(folderName ? `${folderName}.zip` : 'download.zip', files, folder);
    }
    setfolderGenerated(totalGeneratingID);
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
          );
          toast.success(label.cpSelectedDone);
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
  );
}

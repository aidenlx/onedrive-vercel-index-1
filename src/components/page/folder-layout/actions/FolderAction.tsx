'use client';
import { DriveItem } from '@/utils/api/type';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useStore } from '../../store';
import { itemPathGetter } from '../../utils';
import Downloading from '../Downloading';
import { useClipboard } from 'use-clipboard-copy';
import toast from 'react-hot-toast';
import { faArrowAltCircleDown, faCopy } from '@fortawesome/free-regular-svg-icons';
import { DownloadingToastLabels } from '@/components/DownloadingToast';
import { useDownloadMultipleFiles } from '@/utils/useDownloadMultipleFiles';
import { predictLength } from 'client-zip';


export interface FolderActionLabels {
  copyFolder: string;
  cpFolderDone: string;
  downloadFolder: string;
  dlFolderPending: string;
}

export function FolderAction({
  c, label, path,
}: {
  c: DriveItem;
  path: string;
  label: FolderActionLabels & DownloadingToastLabels;
}) {
  const getItemPath = itemPathGetter(path);
  const isGenFolder = useStore(s => s.folderGenerating.has(c.id));
  const setFolderGenerating = useStore(s => s.setFolderGenerating);
  const setfolderGenerated = useStore(s => s.setfolderGenerated);
  const clipboard = useClipboard();

  const downloadMultiple = useDownloadMultipleFiles(label);

  async function handleFolderDownload() {
    setFolderGenerating(c.id);
    const url = new URL(`/api/traverse?path=${getItemPath(c.name)}`, window.location.origin);
    const files = await fetch(url)
      .then(r => r.text())
      .then(csv => {
        return csv.split('\n').flatMap(v => {
          const [path, folder, size] = v.split(',');
          return folder === '0' ? [{ name: path, size: parseInt(size, 10) }] : [];
        });
      });
    await downloadMultiple(
      `${c.name}.zip`,
      files.map(v => encodeURIComponent(v.name)),
      c.name,
      predictLength(files)
    );
    setfolderGenerated(c.id);
  }

  return (
    <>
      <span
        title={label.copyFolder}
        className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
        onClick={() => {
          clipboard.copy(new URL(getItemPath(c.name), window.location.origin).href);
          toast(label.cpFolderDone, { icon: '👌' });
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
  );
}

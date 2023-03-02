'use client';
import { DriveItem } from '@/utils/api/type';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { itemPathGetter } from '../../utils';
import { usePermLink } from '@/utils/usePermLink';
import { useClipboard } from 'use-clipboard-copy';
import toast from 'react-hot-toast';
import { faArrowAltCircleDown, faCopy } from '@fortawesome/free-regular-svg-icons';
import { useSealedURL } from '@/utils/auth/useSeal';


export interface FileActionLabels {
  copyFile: string;
  cpFileDone: string;
  downloadFile: string;
}

export function FileAction({ c, label, path }: { c: DriveItem; path: string; label: FileActionLabels; }) {
  const getItemPath = itemPathGetter(path);
  const clipboard = useClipboard();

  const { payload, error, isLoading } = useSealedURL(path);
  const permlink = usePermLink(getItemPath(c.name), payload);

  return (
    <>
      <button
        title={label.copyFile}
        className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-white dark:hover:bg-gray-600 "
        disabled={error || isLoading}
        onClick={() => {
          clipboard.copy(new URL(permlink, window.location.origin).href);
          toast.success(label.cpFileDone);
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
  );
}

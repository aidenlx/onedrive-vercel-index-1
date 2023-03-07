import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { getFileIcon } from '@ui/utils/getFileIcon'
import { humanFileSize } from '@ui/utils/fileDetails'

import DownloadButtonGroup from '../DownloadBtnGtoup'
import { DownloadBtnContainer, PreviewContainer } from '../layout/Containers'
import { useTranslations } from 'next-intl'
import { DriveItem } from '@od/util/graph-api/type'
import DateTime from '../DateTime'

export default function DefaultPreview({ file, path }: { file: DriveItem; path: string }) {
  const t = useTranslations('file')
  return (
    <div>
      <PreviewContainer>
        <div className="items-center px-5 py-4 md:flex md:space-x-8">
          <div className="rounded-lg border border-gray-900/10 px-8 py-20 text-center dark:border-gray-500/30">
            <FontAwesomeIcon icon={getFileIcon(file.name, { video: Boolean(file.video) })} />
            <div className="mt-6 text-sm font-medium line-clamp-3 md:w-28">{file.name}</div>
          </div>

          <div className="flex flex-col space-y-2 py-4 md:flex-1">
            <div>
              <div className="py-2 text-xs font-medium uppercase opacity-80">{t('Last modified')}</div>
              <div>
                <DateTime value={file.lastModifiedDateTime} />
              </div>
            </div>

            <div>
              <div className="py-2 text-xs font-medium uppercase opacity-80">{t('File size')}</div>
              <div>{humanFileSize(file.size)}</div>
            </div>

            <div>
              <div className="py-2 text-xs font-medium uppercase opacity-80">{t('MIME type')}</div>
              <div>{file.file?.mimeType ?? t('Unavailable')}</div>
            </div>

            <div>
              <div className="py-2 text-xs font-medium uppercase opacity-80">{t('Hashes')}</div>
              <table className="block w-full overflow-scroll whitespace-nowrap text-sm md:table">
                <tbody>
                  <tr className="border-y bg-white dark:border-gray-700 dark:bg-gray-900">
                    <td className="bg-gray-50 py-1 px-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                      Quick XOR
                    </td>
                    <td className="whitespace-nowrap py-1 px-3 font-mono text-gray-500 dark:text-gray-400">
                      {file.file.hashes?.quickXorHash ?? t('Unavailable')}
                    </td>
                  </tr>
                  <tr className="border-y bg-white dark:border-gray-700 dark:bg-gray-900">
                    <td className="bg-gray-50 py-1 px-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                      SHA1
                    </td>
                    <td className="whitespace-nowrap py-1 px-3 font-mono text-gray-500 dark:text-gray-400">
                      {file.file.hashes?.sha1Hash ?? t('Unavailable')}
                    </td>
                  </tr>
                  <tr className="border-y bg-white dark:border-gray-700 dark:bg-gray-900">
                    <td className="bg-gray-50 py-1 px-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                      SHA256
                    </td>
                    <td className="whitespace-nowrap py-1 px-3 font-mono text-gray-500 dark:text-gray-400">
                      {file.file.hashes?.sha256Hash ?? t('Unavailable')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </PreviewContainer>
      <DownloadBtnContainer>
        <DownloadButtonGroup path={path} />
      </DownloadBtnContainer>
    </div>
  )
}

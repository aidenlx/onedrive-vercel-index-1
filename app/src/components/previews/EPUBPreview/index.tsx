import { toPermLink } from "@od/util/permlink"
import { DriveItem } from '@od/util/graph-api/type'
import { DownloadBtnContainer } from '@ui/layout/Containers'
import DownloadButtonGroup from '@ui/DownloadBtnGtoup'
import Viewer from './lazy'
import { useTranslations } from 'next-intl'

export default function EPUBPreview({ path }: { file: DriveItem; path: string }) {
  const t = useTranslations('file')
  return (
    <div>
      <div
        className="no-scrollbar flex w-full flex-col overflow-scroll rounded bg-white dark:bg-gray-900 md:p-3"
        style={{ maxHeight: '90vh' }}
      >
        <Viewer src={toPermLink(path)} label={{ loadingEPUB: t('Loading EPUB') }} />
      </div>
      <DownloadBtnContainer>
        <DownloadButtonGroup path={path} />
      </DownloadBtnContainer>
    </div>
  )
}

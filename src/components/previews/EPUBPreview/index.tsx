import { toPermLink } from "@/utils/permlink-server"
import { DriveItem } from '@/utils/api/type'
import { useToken } from '@/utils/useToken'
import { DownloadBtnContainer } from '../Containers'
import DownloadButtonGroup from '@/components/DownloadBtnGtoup'
import Viewer from './lazy'
import { useTranslations } from 'next-intl'

export default function EPUBPreview({ path }: { file: DriveItem; path: string }) {
  const hashedToken = useToken(path)
  const t = useTranslations('file.epub')
  return (
    <div>
      <div
        className="no-scrollbar flex w-full flex-col overflow-scroll rounded bg-white dark:bg-gray-900 md:p-3"
        style={{ maxHeight: '90vh' }}
      >
        <Viewer src={toPermLink(path, hashedToken)} label={{ loadingEPUB: t('Loading EPUB') }} />
      </div>
      <DownloadBtnContainer>
        <DownloadButtonGroup path={path} />
      </DownloadBtnContainer>
    </div>
  )
}

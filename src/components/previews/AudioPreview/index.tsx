import { DriveItem } from '@/utils/api/type'
import { DownloadBtnContainer, PreviewContainer } from '../Containers'
import DownloadButtonGroup from '@/components/DownloadBtnGtoup'
import { formatModifiedDateTime } from '@/utils/fileDetails'
import { useTranslations } from 'next-intl'
import AudioPlayer from './lazy'
import { toPermLink } from "@/utils/permlink"

export default function AudioPreview({ file, path }: { file: DriveItem; path: string }) {
  // Render audio thumbnail, and also check for broken thumbnails
  const thumbnail = `/api/thumbnail/?path=${path}&size=medium`
  const audioUrl = toPermLink(path)

  const t = useTranslations('file.audio')

  const lastModified = t('Last modified: ', { datetime: formatModifiedDateTime(file.lastModifiedDateTime) })
  return (
    <>
      <PreviewContainer>
        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4">
          <AudioPlayer lastModified={lastModified} src={audioUrl} thumbnail={thumbnail} fileName={file.name} />
        </div>
      </PreviewContainer>
      <DownloadBtnContainer>
        <DownloadButtonGroup path={path} />
      </DownloadBtnContainer>
    </>
  )
}

import { DriveItem } from '@od/util/graph-api/type'
import { DownloadBtnContainer, PreviewContainer } from '@ui/layout/Containers'
import DownloadButtonGroup from '@ui/DownloadBtnGtoup'
import { useTranslations } from 'next-intl'
import AudioPlayer from './lazy'
import { toPermLink } from '@od/util/permlink'
import DateTime from '@/components/DateTime'

export default function AudioPreview({ file, path }: { file: DriveItem; path: string }) {
  // Render audio thumbnail, and also check for broken thumbnails
  const thumbnail = `/api/thumbnail/?path=${path}&size=medium`
  const audioUrl = toPermLink(path)

  const t = useTranslations('file')

  return (
    <>
      <PreviewContainer>
        <div className="flex flex-col space-y-4 md:flex-row md:space-x-4">
          <AudioPlayer
            lastModified={<>{t('Last modified')}: <DateTime value={file.lastModifiedDateTime} /></>}
            src={audioUrl}
            thumbnail={thumbnail}
            fileName={file.name}
          />
        </div>
      </PreviewContainer>
      <DownloadBtnContainer>
        <DownloadButtonGroup path={path} />
      </DownloadBtnContainer>
    </>
  )
}

import { toPermLink } from '@od/util/permlink'
import { DriveItem } from '@od/util/graph-api/type'
import { getExtension } from '@ui/utils/getFileIcon'
import { DownloadBtnContainer, PreviewContainer } from '@ui/layout/Containers'
import DownloadButtonGroup from '@ui/DownloadBtnGtoup'
import VideoPlayer, { OpenInPlayers } from './lazy'
import { useTranslations } from 'next-intl'

export default function VideoPreview({ file, path }: { file: DriveItem; path: string }) {
  // OneDrive generates thumbnails for its video files, we pick the thumbnail with the highest resolution
  const thumbnail = `/api/thumbnail/?path=${path}&size=large`

  // We assume subtitle files are beside the video with the same name, only webvtt '.vtt' files are supported
  const vtt = `${path.substring(0, path.lastIndexOf('.'))}.vtt`
  const subtitle = toPermLink(vtt)

  // We also format the raw video file for the in-browser player as well as all other players
  const videoUrl = toPermLink(path)

  const isFlv = getExtension(file.name) === 'flv'

  const props = {
    videoName: file.name,
    videoUrl,
    width: file.video?.width ?? undefined,
    height: file.video?.height ?? undefined,
    thumbnail,
    subtitle,
    isFlv,
  }

  const t = useTranslations('file')

  return (
    <>
      <PreviewContainer>
        <VideoPlayer label={{ 'Loading FLV extension': t('Loading FLV extension') }} {...props} />
      </PreviewContainer>
      <DownloadBtnContainer>
        <DownloadButtonGroup path={path}>
          <OpenInPlayers path={path} />
        </DownloadButtonGroup>
      </DownloadBtnContainer>
    </>
  )
}

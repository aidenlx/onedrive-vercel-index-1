import { toPermLink } from "@/utils/permlink-server"
import { DriveItem } from '@/utils/api/type'
import { getExtension } from '@/utils/getFileIcon'
import { useToken } from '@/utils/useToken'
import { DownloadBtnContainer, PreviewContainer } from '../Containers'
import DownloadButtonGroup from '@/components/DownloadBtnGtoup'
import { OpenInPlayers, VideoPlayerWarpper } from './client'
import { useTranslations } from 'next-intl'

export default function VideoPreview({ file, path }: { file: DriveItem; path: string }) {
  const hashedToken = useToken(path)

  // OneDrive generates thumbnails for its video files, we pick the thumbnail with the highest resolution
  const thumbnail = `/api/thumbnail/?path=${path}&size=large${hashedToken ? `&odpt=${hashedToken}` : ''}`

  // We assume subtitle files are beside the video with the same name, only webvtt '.vtt' files are supported
  const vtt = `${path.substring(0, path.lastIndexOf('.'))}.vtt`
  const subtitle = toPermLink(vtt, hashedToken)

  // We also format the raw video file for the in-browser player as well as all other players
  const videoUrl = toPermLink(path, hashedToken)

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

  const t = useTranslations('file.video')

  return (
    <>
      <PreviewContainer>
        <VideoPlayerWarpper label={{ 'Loading FLV extension': t('Loading FLV extension') }} {...props} />
      </PreviewContainer>
      <DownloadBtnContainer>
        <DownloadButtonGroup path={path}>
          <OpenInPlayers videoUrl={videoUrl} />
        </DownloadButtonGroup>
      </DownloadBtnContainer>
    </>
  )
}

'use client'

import { DownloadButton } from '@/components/DownloadButton'
import { useSealedURL } from '@/utils/auth/useSeal'
import { toPermLink } from '@/utils/permlink'
import { getBaseUrl } from '@/utils/useBaseUrl'

import iina from '@players/iina.png'
import vlc from '@players/vlc.png'
import potplayer from '@players/potplayer.png'
import nplayer from '@players/nplayer.png'

function getHostname() {
  return window?.location.hostname ?? ''
}

export function OpenInPlayers({ path }: { path: string }) {
  const { payload, error, isLoading } = useSealedURL(path)
  const videoUrl = toPermLink(path, payload)

  return (
    <>
      <DownloadButton
        disabled={isLoading || error}
        onClickCallback={() => window.open(`iina://weblink?url=${encodeURIComponent(getBaseUrl() + videoUrl)}`)}
        btnText="IINA"
        btnImage={iina}
      />
      <DownloadButton
        disabled={isLoading || error}
        onClickCallback={() => window.open(`vlc://${getBaseUrl() + videoUrl}`)}
        btnText="VLC"
        btnImage={vlc}
      />
      <DownloadButton
        disabled={isLoading || error}
        onClickCallback={() => window.open(`potplayer://${getBaseUrl() + videoUrl}`)}
        btnText="PotPlayer"
        btnImage={potplayer}
      />
      <DownloadButton
        disabled={isLoading || error}
        onClickCallback={() => window.open(`nplayer-http://${getHostname() + videoUrl}`)}
        btnText="nPlayer"
        btnImage={nplayer}
      />
    </>
  )
}

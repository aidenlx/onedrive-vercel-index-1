'use client'

import { DownloadButton } from '@ui/DownloadButton'
import { useMagicLink } from '@od/util/protect-client'
import { toPermLink } from '@od/util/permlink'
import { getBaseUrl } from '@ui/utils/useBaseUrl'

import iina from '@players/iina.png'
import vlc from '@players/vlc.png'
import potplayer from '@players/potplayer.png'
import nplayer from '@players/nplayer.png'

function getHostname() {
  return window?.location.hostname ?? ''
}

export function OpenInPlayers({ path }: { path: string }) {
  const { payload, error, isLoading } = useMagicLink(path)
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

'use client'

import { DownloadButton } from "@/components/DownloadButton";
import { getBaseUrl } from "@/utils/getBaseUrl";

export function OpenInPlayers({ videoUrl }: { videoUrl: string }) {
  return (
    <>
      <DownloadButton
        onClickCallback={() => window.open(`iina://weblink?url=${getBaseUrl()}${videoUrl}`)}
        btnText="IINA"
        btnImage="/players/iina.png"
      />
      <DownloadButton
        onClickCallback={() => window.open(`vlc://${getBaseUrl()}${videoUrl}`)}
        btnText="VLC"
        btnImage="/players/vlc.png"
      />
      <DownloadButton
        onClickCallback={() => window.open(`potplayer://${getBaseUrl()}${videoUrl}`)}
        btnText="PotPlayer"
        btnImage="/players/potplayer.png"
      />
      <DownloadButton
        onClickCallback={() => window.open(`nplayer-http://${window?.location.hostname ?? ''}${videoUrl}`)}
        btnText="nPlayer"
        btnImage="/players/nplayer.png"
      />
    </>
  )
}

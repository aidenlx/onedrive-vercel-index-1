'use client'

import { LoadingIcon } from '@/components/LoadingClient'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef, useState } from 'react'
import ReactAudioPlayer from 'react-audio-player'

enum PlayerState {
  Loading,
  Ready,
  Playing,
  Paused,
}

export interface Props {
  fileName?: string
  thumbnail: string
  src: string
  lastModified: string
}

export default function AudioPlayer({ fileName, thumbnail, src, lastModified }: Props) {
  const rapRef = useRef<ReactAudioPlayer>(null)
  const [playerStatus, setPlayerStatus] = useState(PlayerState.Loading)
  const [playerVolume, setPlayerVolume] = useState(1)

  useEffect(() => {
    // Manually get the HTML audio element and set onplaying event.
    // - As the default event callbacks provided by the React component does not guarantee playing state to be set
    // - properly when the user seeks through the timeline or the audio is buffered.
    const rap = rapRef.current?.audioEl.current
    if (rap) {
      rap.oncanplay = () => setPlayerStatus(PlayerState.Ready)
      rap.onended = () => setPlayerStatus(PlayerState.Paused)
      rap.onpause = () => setPlayerStatus(PlayerState.Paused)
      rap.onplay = () => setPlayerStatus(PlayerState.Playing)
      rap.onplaying = () => setPlayerStatus(PlayerState.Playing)
      rap.onseeking = () => setPlayerStatus(PlayerState.Loading)
      rap.onwaiting = () => setPlayerStatus(PlayerState.Loading)
      rap.onerror = () => setPlayerStatus(PlayerState.Paused)
      rap.onvolumechange = () => setPlayerVolume(rap.volume)
    }
  }, [])

  return (
    <>
      <div className="relative flex aspect-square w-full items-center justify-center rounded bg-gray-100 transition-all duration-75 dark:bg-gray-700 md:w-48">
        <Loading status={playerStatus} />
        <Thumbnail status={playerStatus} src={thumbnail} alt={fileName} />
      </div>
      <div className="flex w-full flex-col justify-between">
        <div>
          <div className="mb-2 font-medium">{fileName}</div>
          <div className="mb-4 text-sm text-gray-500">{lastModified}</div>
        </div>
        <ReactAudioPlayer
          className="h-11 w-full"
          src={src}
          ref={rapRef}
          controls
          preload="auto"
          volume={playerVolume}
        />
      </div>
    </>
  )
}

function Thumbnail({ src, alt, status }: { src: string; alt?: string; status: PlayerState }) {
  const [brokenThumbnail, setBrokenThumbnail] = useState(false)

  if (brokenThumbnail) {
    return (
      <FontAwesomeIcon
        className={`z-10 h-5 w-5 ${status === PlayerState.Playing ? 'animate-spin' : ''}`}
        icon="music"
        size="2x"
      />
    )
  }
  return (
    <div className="absolute m-4 aspect-square rounded-full shadow-lg">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={`h-full w-full rounded-full object-cover object-top ${
          status === PlayerState.Playing ? 'animate-spin-slow' : ''
        }`}
        src={src}
        alt={alt}
        onError={() => setBrokenThumbnail(true)}
      />
    </div>
  )
}

function Loading({ status }: { status: PlayerState }) {
  return (
    <div
      className={`absolute z-20 flex h-full w-full items-center justify-center transition-all duration-300 ${
        status === PlayerState.Loading ? 'bg-white opacity-80 dark:bg-gray-800' : 'bg-transparent opacity-0'
      }`}
    >
      <LoadingIcon className="z-10 inline-block h-5 w-5 animate-spin" />
    </div>
  )
}

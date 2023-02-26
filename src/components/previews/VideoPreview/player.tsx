'use client'

import FourOhFour from '@/components/FourOhFourClient'
import Loading from '@/components/Loading'
import Plyr from 'plyr-react'
import { useEffect } from 'react'
import { useAsync } from 'react-async-hook'

import 'plyr-react/plyr.css'

export type VideoPlayerProps = { isFlv: boolean; label: { 'Loading FLV extension': string } } & Omit<
  VideoPlayerProps0,
  'mpegts'
>

export default function VideoPlayerWarpper({ isFlv, label, ...props }: VideoPlayerProps) {
  const {
    loading,
    error,
    result: mpegts,
  } = useAsync(async () => {
    if (isFlv) {
      return (await import('mpegts.js')).default
    }
  }, [isFlv])
  if (error) {
    return <FourOhFour>{error.message}</FourOhFour>
  }
  if (loading && isFlv) {
    return <Loading loadingText={label['Loading FLV extension']} />
  }
  return <VideoPlayer mpegts={mpegts} isFlv={isFlv} {...props} />
}

interface VideoPlayerProps0 {
  videoName: string
  videoUrl: string
  width?: number
  height?: number
  thumbnail: string
  subtitle: string
  isFlv: boolean
  mpegts: any
}

function VideoPlayer({ videoName, videoUrl, width, height, thumbnail, subtitle, isFlv, mpegts }: VideoPlayerProps0) {
  useSubtitle(subtitle)
  useFlv(videoUrl, isFlv, mpegts)
  // Common plyr configs, including the video source and plyr options
  const plyrSource = {
    type: 'video',
    title: videoName,
    poster: thumbnail,
    tracks: [{ kind: 'captions', label: videoName, src: '', default: true }],
  }
  const plyrOptions: Plyr.Options = {
    ratio: `${width ?? 16}:${height ?? 9}`,
    fullscreen: { iosNative: true },
  }
  if (!isFlv) {
    // If the video is not in flv format, we can use the native plyr and add sources directly with the video URL
    plyrSource['sources'] = [{ src: videoUrl }]
  }
  return <Plyr id="plyr" source={plyrSource as Plyr.SourceInfo} options={plyrOptions} />
}

const useSubtitle = (subtitle: string) => {
  useEffect(() => {
    // Really really hacky way to inject subtitles as file blobs into the video element
    fetch(subtitle)
      .then(resp => resp.blob())
      .then(blob => {
        const track = document.querySelector('track')
        track?.setAttribute('src', URL.createObjectURL(blob))
      })
      .catch(() => {
        console.log('Could not load subtitle.')
      })
  }, [subtitle])
}

const useFlv = (videoUrl: string, isFlv: boolean, mpegts: any) => {
  useEffect(() => {
    if (!isFlv) return
    // Really hacky way to get the exposed video element from Plyr
    const video = document.getElementById('plyr')
    const flv = mpegts.createPlayer({ url: videoUrl, type: 'flv' })
    flv.attachMediaElement(video)
    flv.load()
    return () => flv.destroy()
  }, [videoUrl, isFlv, mpegts])
}

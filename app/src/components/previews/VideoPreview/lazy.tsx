'use client'

import Loading from '@ui/Loading'
import { lazy, Suspense } from 'react'
import type { VideoPlayerProps } from './player'

const Lazy = lazy(() => import('./player'))

export default function Viewer(props: VideoPlayerProps) {
  return (
    <Suspense fallback={<Loading loadingText='Loading Viewer'/>}>
      <Lazy {...props} />
    </Suspense>
  )
}

export { OpenInPlayers } from './open-in'

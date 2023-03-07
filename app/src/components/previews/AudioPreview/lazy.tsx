'use client'

import Loading from '@ui/Loading'
import { lazy, Suspense } from 'react'
import { Props } from './player'

const Lazy = lazy(() => import('./player'))

export default function Viewer(props: Props) {
  return (
    <Suspense fallback={<Loading loadingText='Loading Viewer'/>}>
      <Lazy {...props} />
    </Suspense>
  )
}

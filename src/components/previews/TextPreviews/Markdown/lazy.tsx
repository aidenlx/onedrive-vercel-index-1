'use client'

import Loading from '@/components/LoadingClient'
import { lazy, Suspense } from 'react'
import { Props } from './viewer'

const Lazy = lazy(() => import('./viewer'))

export default function Viewer(props: Props) {
  return (
    <Suspense fallback={<Loading loadingText='Loading Viewer'/>}>
      <Lazy {...props} />
    </Suspense>
  )
}

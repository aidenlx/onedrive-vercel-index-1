import { Suspense } from 'react'
import TextPreviewBase from '../TextPreviewBase'

import Viewer from './lazy'

export default function CodePreview({ path, standalone }: { path: string; standalone?: boolean }) {
  return (
    <TextPreviewBase standalone={standalone} path={path}>
      {content => <Viewer content={content} standalone={standalone} path={path} />}
    </TextPreviewBase>
  )
}

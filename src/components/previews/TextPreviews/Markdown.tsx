import TextPreviewBase from './TextPreviewBase'

import Viewer from './MarkdownClient'

export default function CodePreview({ path, standalone }: { path: string; standalone?: boolean }) {
  return (
    <TextPreviewBase standalone={standalone} path={path}>
      {content => <Viewer content={content} standalone={standalone} path={path} />}
    </TextPreviewBase>
  )
}

import { DriveItem } from '@/utils/api/type'
import TextPreviewBase from './TextPreviewBase'

import Viewer from './CodeClient'

export default function CodePreview({ path, file }: { path: string; file: DriveItem }) {
  return <TextPreviewBase path={path}>{content => <Viewer fileName={file.name} content={content} />}</TextPreviewBase>
}

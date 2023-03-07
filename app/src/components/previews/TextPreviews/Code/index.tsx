import { DriveItem } from '@od/util/graph-api/type'
import TextPreviewBase from '../TextPreviewBase'

import Viewer from './lazy'

export default function CodePreview({ path, file }: { path: string; file: DriveItem }) {
  return <TextPreviewBase path={path}>{content => <Viewer fileName={file.name} content={content} />}</TextPreviewBase>
}

import { getExtension } from '@/utils/getFileIcon'
import { getPreviewType, preview } from '@/utils/getPreviewType'
import AudioPreview from '../previews/AudioPreview'
import CodePreview from '../previews/CodePreview'
import DefaultPreview from '../previews/DefaultPreview'
import EPUBPreview from '../previews/EPUBPreview'
import ImagePreview from '../previews/ImagePreview'
import MarkdownPreview from '../previews/MarkdownPreview'
import OfficePreview from '../previews/OfficePreview'
import PDFPreview from '../previews/PDFPreview'
import TextPreview from '../previews/TextPreview'
import URLPreview from '../previews/URLPreview'
import VideoPreview from '../previews/VideoPreview'
import { FileData } from '../../utils/api/type'

export default function FilePreview({ value: file, path }: FileData & { path: string }) {
  const previewType = getPreviewType(getExtension(file.name), { video: Boolean(file.video) })
  if (!previewType) {
    return <DefaultPreview file={file} />
  }
  switch (previewType) {
    case preview.image:
      return <ImagePreview file={file} />

    case preview.text:
      return <TextPreview file={file} />

    case preview.code:
      return <CodePreview file={file} />

    case preview.markdown:
      return <MarkdownPreview file={file} path={path} />

    case preview.video:
      return <VideoPreview file={file} />

    case preview.audio:
      return <AudioPreview file={file} />

    case preview.pdf:
      return <PDFPreview file={file} />

    case preview.office:
      return <OfficePreview file={file} />

    case preview.epub:
      return <EPUBPreview file={file} />

    case preview.url:
      return <URLPreview file={file} />

    default:
      return <DefaultPreview file={file} />
  }
}

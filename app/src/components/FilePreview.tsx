import { getExtension } from '@ui/utils/getFileIcon'
import { getPreviewType, preview } from '@ui/utils/getPreviewType'
import AudioPreview from './previews/AudioPreview'
import CodePreview from './previews/TextPreviews/Code'
import DefaultPreview from './previews/DefaultPreview'
import EPUBPreview from './previews/EPUBPreview'
import ImagePreview from './previews/ImagePreview'
import MarkdownPreview from './previews/TextPreviews/Markdown'
import OfficePreview from './previews/OfficePreview'
import PDFPreview from './previews/PDFPreview'
import TextPreview from './previews/TextPreviews/PlainText'
import URLPreview from './previews/URLPreview'
import VideoPreview from './previews/VideoPreview'
import { FileData } from '@od/util/graph-api/type'

export default function FilePreview({ value: file, path }: FileData & { path: string }) {
  const previewType = getPreviewType(getExtension(file.name), { video: Boolean(file.video) })

  const defaultPreview = <DefaultPreview file={file} path={path} />
  if (!previewType) {
    return defaultPreview
  }
  switch (previewType) {
    case preview.image:
      return <ImagePreview file={file} path={path} />
    case preview.text:
      return <TextPreview path={path} />
    case preview.code:
      return <CodePreview file={file} path={path} />
    case preview.markdown:
      return <MarkdownPreview path={path} />
    case preview.video:
      return <VideoPreview file={file} path={path} />
    case preview.audio:
      return <AudioPreview file={file} path={path} />
    case preview.pdf:
      return <PDFPreview path={path} />
    case preview.office:
      return <OfficePreview path={path} />
    case preview.epub:
      return <EPUBPreview file={file} path={path} />
    case preview.url:
      return <URLPreview path={path} />
    default:
      return defaultPreview
  }
}

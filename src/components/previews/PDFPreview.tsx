import DownloadButtonGroup from '../DownloadBtnGtoup'
import { toPermLink } from '@/utils/permlink'
import { DownloadBtnContainer } from './Containers'

export default function PDFEmbedPreview({ path }: { path: string }) {
  const query = new URLSearchParams()
  query.append('file', toPermLink(path))

  return (
    <div>
      <div className="w-full overflow-hidden rounded" style={{ height: '90vh' }}>
        <iframe src={`/assets/pdfjs/web/viewer.html?${query}`} frameBorder="0" width="100%" height="100%"></iframe>
      </div>
      <DownloadBtnContainer>
        <DownloadButtonGroup path={path} />
      </DownloadBtnContainer>
    </div>
  )
}

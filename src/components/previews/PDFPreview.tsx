import DownloadButtonGroup from '../DownloadBtnGtoup'
import { toPermLink } from "@/utils/permlink-server"
import { DownloadBtnContainer } from './Containers'

export default function PDFEmbedPreview({ path }: { path: string }) {
  const hashedToken = ''

  const url = new URL('https://mozilla.github.io/pdf.js/web/viewer.html')
  url.searchParams.append('file', toPermLink(path, hashedToken))

  return (
    <div>
      <div className="w-full overflow-hidden rounded" style={{ height: '90vh' }}>
        <iframe src={url.href} frameBorder="0" width="100%" height="100%"></iframe>
      </div>
      <DownloadBtnContainer>
        <DownloadButtonGroup path={path} />
      </DownloadBtnContainer>
    </div>
  )
}

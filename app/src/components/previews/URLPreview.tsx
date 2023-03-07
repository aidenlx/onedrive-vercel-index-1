import Loading from '../Loading'
import { DownloadButton } from '../DownloadButton'
import { DownloadBtnContainer, PreviewContainer } from '../layout/Containers'
import { useTranslations } from 'next-intl'
import { Suspense } from 'react'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons'
import { fetchWithAuth, getDownload } from '@od/util/graph-api'
import { EmptyFileError } from '@ui/Error'

const parseDotUrl = (content: string): string | undefined => {
  return content
    .split('\n')
    .find(line => line.startsWith('URL='))
    ?.split('=')[1]
}

async function URLPreviewContent({ path }: { path: string }) {
  const [downloadLink] = await getDownload(path)
  const content = await fetchWithAuth(downloadLink).then(res => res.text())
  if (!content) return <EmptyFileError path={path} />

  return <URLPreviewMainContent content={content} />
}

function URLPreviewMainContent({ content }: { content: string }) {
  const t = useTranslations('file')

  return (
    <>
      <PreviewContainer>
        <pre className="overflow-x-scroll p-0 text-sm md:p-3">{content}</pre>
      </PreviewContainer>
      <DownloadBtnContainer>
        <div className="flex justify-center">
          <DownloadButton
            onClickCallback={() => window.open(parseDotUrl(content) ?? '')}
            btnColor="blue"
            btnText={t('Open URL')}
            btnIcon={faExternalLinkAlt}
            btnTitle={t('Open URL{{url}}', { url: ' ' + parseDotUrl(content) ?? '' })}
          />
        </div>
      </DownloadBtnContainer>
    </>
  )
}

export default function URLPreview({ path }: { path: string }) {
  const t = useTranslations('file')
  return (
    <Suspense
      fallback={
        <PreviewContainer>
          <Loading loadingText={t('Loading file content')} />
        </PreviewContainer>
      }
    >
      {/* @ts-expect-error async server component */}
      <URLPreviewContent path={path} />
    </Suspense>
  )
}

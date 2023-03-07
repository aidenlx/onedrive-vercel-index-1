import Loading from '@ui/Loading'
import DownloadButtonGroup from '@ui/DownloadBtnGtoup'
import { DownloadBtnContainer, PreviewContainer } from '@ui/layout/Containers'
import { useTranslations } from 'next-intl'
import { ReactNode, Suspense } from 'react'
import { fetchWithAuth, getDownload } from '@od/util/graph-api'
import { EmptyFileError } from '@ui/Error'

export interface TextPreviewContentProps {
  path: string
  children: (content: string) => ReactNode
}

async function TextPreviewContent({ path, children: renderContent }: TextPreviewContentProps) {
  const [downloadLink] = await getDownload(path)
  const content = await fetchWithAuth(downloadLink).then(res => res.text())
  if (!content) return <EmptyFileError path={path} />
  return renderContent(content)
}

export default function TextPreviewBase({
  standalone = true,
  ...props
}: TextPreviewContentProps & { standalone?: boolean }) {
  const t = useTranslations('file')
  return (
    <>
      <PreviewContainer>
        <Suspense fallback={<Loading loadingText={t('Loading file content')} />}>
          {/* @ts-expect-error async server component */}
          <TextPreviewContent {...props} />
        </Suspense>
      </PreviewContainer>
      {standalone && (
        <DownloadBtnContainer>
          <DownloadButtonGroup path={props.path} />
        </DownloadBtnContainer>
      )}
    </>
  )
}

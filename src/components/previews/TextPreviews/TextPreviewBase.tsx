import Loading from '@/components/Loading'
import DownloadButtonGroup from '@/components/DownloadBtnGtoup'
import { DownloadBtnContainer, PreviewContainer } from '../Containers'
import { useTranslations } from 'next-intl'
import { ReactNode, Suspense } from 'react'
import { getDownloadLink } from '@/utils/od-api/getDownloadLink'
import { fetchWithAuth } from '@/utils/od-api/fetchWithAuth'
import { EmptyFileError } from '@/components/Error'

export interface TextPreviewContentProps {
  path: string
  children: (content: string) => ReactNode
}

async function TextPreviewContent({ path, children: renderContent }: TextPreviewContentProps) {
  const [downloadLink] = await getDownloadLink(path)
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
          {/* @ts-expect-error server component */}
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

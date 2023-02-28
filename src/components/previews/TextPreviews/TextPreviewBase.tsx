import FourOhFour from '@/components/FourOhFour'
import Loading from '@/components/Loading'
import DownloadButtonGroup from '@/components/DownloadBtnGtoup'
import { DownloadBtnContainer, PreviewContainer } from '../Containers'
import { useTranslations } from 'next-intl'
import { ReactNode, Suspense } from 'react'
import { getAccessToken } from '@/utils/api/common'
import { kv } from '@/utils/kv/edge'
import { getDownloadLink } from '@/utils/od-api/getDownloadLink'
import { fetchWithAuth } from '@/utils/od-api/fetchWithAuth'

export interface TextPreviewContentProps {
  path: string
  children: (content: string) => ReactNode
}

async function TextPreviewContent({ path, children: renderContent }: TextPreviewContentProps) {
  try {
    const accessToken = await getAccessToken(kv)
    const [downloadLink] = await getDownloadLink(path, accessToken, false)
    const content = await fetchWithAuth(downloadLink, { accessToken }).then(res => res.text())
    if (!content) {
      return <EmptyTextFile />
    }
    return renderContent(content)
  } catch (error) {
    console.error(error)
    return <FourOhFour>{error instanceof Error ? error.message : JSON.stringify(error)}</FourOhFour>
  }
}

export function EmptyTextFile() {
  const t = useTranslations('file.text')
  return <FourOhFour>{t('File is empty')}</FourOhFour>
}

export default function TextPreviewBase({
  standalone = true,
  ...props
}: TextPreviewContentProps & { standalone?: boolean }) {
  const t = useTranslations('file.text')
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

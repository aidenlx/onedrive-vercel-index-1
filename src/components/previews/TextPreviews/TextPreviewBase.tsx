import FourOhFour from '@/components/FourOhFour'
import Loading from '@/components/Loading'
import DownloadButtonGroup from '@/components/DownloadBtnGtoup'
import { DownloadBtnContainer, PreviewContainer } from '../Containers'
import { toPermLink } from '@/utils/permlink-server'
import { useTranslations } from 'next-intl'
import { ReactNode, Suspense } from 'react'

export interface TextPreviewContentProps {
  path: string
  children: (content: string) => ReactNode
}

async function TextPreviewContent({ path, children: renderContent }: TextPreviewContentProps) {
  const hashedToken = ''

  try {
    const content = await fetch(toPermLink(path, hashedToken)).then(res =>
      res.ok ? res.text() : Promise.reject(new Error(res.statusText))
    )
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

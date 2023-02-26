import FourOhFour from '../FourOhFour'
import Loading from '../Loading'
import { DownloadButton } from '../DownloadButton'
import { DownloadBtnContainer, PreviewContainer } from './Containers'
import { useTranslations } from 'next-intl'
import { Suspense } from 'react'
import { EmptyTextFile } from './TextPreviews/TextPreviewBase'
import { useToken } from '@/utils/useToken'
import { toPermLink } from "@/utils/permlink-server"

const parseDotUrl = (content: string): string | undefined => {
  return content
    .split('\n')
    .find(line => line.startsWith('URL='))
    ?.split('=')[1]
}

async function URLPreviewContent({ path }: { path: string }) {
  const hashedToken = useToken(path)

  try {
    const content = await fetch(toPermLink(path, hashedToken)).then(res =>
      res.ok ? res.text() : Promise.reject(new Error(res.statusText))
    )
    if (!content) {
      return (
        <PreviewContainer>
          <EmptyTextFile />
        </PreviewContainer>
      )
    }
    return <URLPreviewMainContent content={content} />
  } catch (error) {
    return (
      <PreviewContainer>
        <FourOhFour>{error instanceof Error ? error.message : JSON.stringify(error)}</FourOhFour>
      </PreviewContainer>
    )
  }
}

function URLPreviewMainContent({ content }: { content: string }) {
  const t = useTranslations('file.url')

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
            btnIcon="external-link-alt"
            btnTitle={t('Open URL{{url}}', { url: ' ' + parseDotUrl(content) ?? '' })}
          />
        </div>
      </DownloadBtnContainer>
    </>
  )
}

export default function URLPreview({ path }: { path: string }) {
  const t = useTranslations('file.text')
  return (
    <Suspense
      fallback={
        <PreviewContainer>
          <Loading loadingText={t('Loading file content')} />
        </PreviewContainer>
      }
    >
      {/* @ts-expect-error server component */}
      <URLPreviewContent path={path} />
    </Suspense>
  )
}

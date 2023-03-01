import { redirect } from 'next-intl/server'
import { PreviewContainer } from '@/components/previews/Containers'
import { getPageData } from './fetch'
import FourOhFour from '@/components/FourOhFour'
import { queryToPath } from '@/components/page/utils'
import { useTranslations } from 'next-intl'
import FolderView from '@/components/page/folder/FolderView'
import FilePreview from '@/components/page/FilePreview'
import { locales } from '@/locale'
import { arrayAsyncFrom } from '@/utils/arrayAsyncFrom'
import { traverseFolder } from '@/utils/od-api/traverseFolder'
import { NoAccessTokenError } from '@/utils/oauth/get-at'
import { title } from '@cfg/site.config'

interface Params {
  locale: string
  paths?: string[]
}

export async function generateStaticParams(): Promise<Params[]> {
  if (process.env.NODE_ENV !== 'production') return []
  const files = await traverseFolder('/', Infinity)
  return (await arrayAsyncFrom(files)).flatMap(({ paths }) =>
    locales.map(locale => ({ locale, paths: paths.map(decodeURIComponent) }))
  )
}

export const revalidate = 43200 // 12 hours

export const dynamic = 'error'

export async function generateMetadata({ params }: { params: Params }) {
  const name = params?.paths?.pop() ?? ''
  const pageTitle = name ? [decodeURIComponent(name), title].join(' - ') : title
  return { title: pageTitle }
}

export default async function Page({ params }: { params: { paths?: string[] } }) {
  const path = queryToPath(params.paths)

  const data = await getPageData(path).catch(error => ({ type: 'error', error } as const))

  switch (data.type) {
    case 'error': {
      const { error } = data
      if (error instanceof NoAccessTokenError) {
        // If error includes 403 which means the user has not completed initial setup, redirect to OAuth page
        redirect('/onedrive-vercel-index-oauth/step-1')
      }
      return (
        <PreviewContainer>
          <FourOhFour>{JSON.stringify(error instanceof Error ? error.message : error)}</FourOhFour>
        </PreviewContainer>
      )
    }
    case 'file':
      return <FilePreview {...data} path={path} />
    case 'folder':
      return <FolderView {...data} path={path} />
    default:
      return <Fallback path={path} />
  }
}

function Fallback({ path }: { path: string }) {
  const t = useTranslations('file.fallback')
  return (
    <PreviewContainer>
      <FourOhFour>{t('Cannot preview {{path}}', { path })}</FourOhFour>
    </PreviewContainer>
  )
}

function toInt(str: string | string[] | undefined, fallback: number) {
  if (str === undefined) return fallback
  if (Array.isArray(str)) str = str[0]
  const num = parseInt(str, 10)
  return Number.isNaN(num) ? fallback : num
}

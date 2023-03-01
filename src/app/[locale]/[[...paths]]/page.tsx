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

export async function generateStaticParams(): Promise<{ locale: string; paths: string[] }[]> {
  const paths = process.env.NODE_ENV === 'production' ? await arrayAsyncFrom(await traverseFolder()) : [[]]
  return paths.flatMap(paths => locales.map(locale => ({ locale, paths })))
}

export const revalidate = 43200 // 12 hours

export const dynamic = 'error'
export const dynamicParams = false

export function generateMetadata({ params }: { params: { paths?: string[] } }) {
  const paths = queryToPath(params.paths)
  return { title: [decodeURIComponent(paths.substring(1)), title].join(' ') }
}

export default async function Page({
  params,
}: // searchParams,
{
  params: { paths?: string[] }
  // searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const path = queryToPath(params.paths)

  const size = 0
  // this will cause static generation to fail
  // const size = toInt(searchParams?.size, 0)

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

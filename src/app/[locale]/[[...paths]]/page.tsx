import { redirect } from 'next-intl/server'
import { PreviewContainer } from '@/components/previews/Containers'
import Auth from '@/components/page/Auth'
import { getPageData, NoAccessTokenError, NoAuthError } from './fetch'
import FourOhFour from '@/components/FourOhFour'
import { queryToPath } from '@/components/page/utils'
import { kv } from '@/utils/kv/edge'
import { useTranslations } from 'next-intl'
import FolderView from '@/components/page/folder/FolderView'
import FilePreview from '@/components/page/FilePreview'
import { useToken } from '@/utils/useToken'
import { locales } from '@/locale'

// export function generateStaticParams() {
//   // statically render home page
//   return locales.map(locale => ({ locale, paths: [] }))
// }

export const revalidate = 1800

export default async function Page({
  params,
  searchParams,
}: {
  params: { paths?: string[] }
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const path = queryToPath(params.paths),
    size = toInt(searchParams?.size, 0)

  const hashedToken = useToken(decodeURIComponent(path))

  const data = await getPageData(path, size, { kv, token: hashedToken }).catch(
    error => ({ type: 'error', error } as const)
  )

  switch (data.type) {
    case 'error': {
      const { error } = data
      if (error instanceof NoAccessTokenError) {
        // If error includes 403 which means the user has not completed initial setup, redirect to OAuth page
        redirect('/onedrive-vercel-index-oauth/step-1')
      }
      return (
        <PreviewContainer>
          {error instanceof NoAuthError ? (
            <AuthWarpper redirect={path} />
          ) : (
            <FourOhFour>{JSON.stringify(error instanceof Error ? error.message : error)}</FourOhFour>
          )}
        </PreviewContainer>
      )
    }
    case 'file':
      return <FilePreview {...data} path={path} />
    case 'folder':
      return <FolderView {...data} size={size} path={path} token={hashedToken} />
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

function AuthWarpper({ redirect }: { redirect: string }) {
  const t = useTranslations('layout.auth')
  return (
    <Auth
      redirect={redirect}
      label={{
        'Enter Password': t('Enter Password'),
        'If you know the password, please enter it below': t('If you know the password, please enter it below'),
        'This route (the folder itself and the files inside) is password protected': t(
          'This route (the folder itself and the files inside) is password protected'
        ),
      }}
    />
  )
}

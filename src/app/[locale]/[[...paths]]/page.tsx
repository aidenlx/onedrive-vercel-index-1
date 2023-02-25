import { redirect } from 'next-intl/server'
import { PreviewContainer } from '@/components/previews/Containers'
import Auth from '@/components/page/Auth'
import { getPageData, NoAccessTokenError, NoAuthError } from './fetch'
// import FourOhFour from '@/components/page/FourOhFour'
import { queryToPath } from '@/components/page/utils'
import { kv } from '@/utils/kv/edge'
import { useTranslations } from 'next-intl'
import FolderView from '@/components/page/folder/FolderView'
// import FilePreview from '@/components/page/FilePreview'
import { useToken } from '@/utils/useToken'
import { protectedToken } from '@/utils/cookie'
import { cookies } from 'next/headers'

// export function generateStaticParams() {
//   // statically render home page
//   return [{ locale: 'en', paths: [] }]
// }

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
          {
            error instanceof NoAuthError ? <AuthWarpper redirect={path} /> : null
            // <FourOhFour errorMsg={JSON.stringify(error instanceof Error ? error.message : error)} />
          }
        </PreviewContainer>
      )
    }
    case 'file':
      // return <FilePreview {...data} path={path} />
      return <span>file</span>
    case 'folder':
      return <FolderView {...data} size={size} path={path} token={hashedToken} />
    default:
      return (
        <PreviewContainer>
          <span>cant preview</span>
          {/* <FourOhFour errorMsg={t('Cannot preview {{path}}', { path })} /> */}
        </PreviewContainer>
      )
  }
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

import { redirect } from 'next-intl/server'
import getPageData from './fetch'
import { getPathFromSegments } from '@ui/utils/page'
import FolderView from '@ui/folder/FolderView'
import FilePreview from '@ui/FilePreview'
import { NoAccessTokenError } from '@od/util/oauth'
import { NoItemHandlerError } from '@ui/Error'
import { authRoute } from '@od/util/protect/const'
import { PreviewContainer } from '@ui/layout/Containers'
import { Auth } from '@ui/Auth'
import { useTranslations } from 'next-intl'
import { Suspense } from 'react'
import Loading from '@ui/Loading'

export default async function Page({ params }: { params: { paths?: string[] } }) {
  if (params.paths) {
    const pathname = `/${params.paths.join('/')}`
    if (pathname.startsWith(authRoute)) {
      const acutalPaths = pathname.replace(authRoute, '').split('/').filter(Boolean)
      return (
        <PreviewContainer>
          <AuthWarpper redirect={getPathFromSegments(acutalPaths)} />
        </PreviewContainer>
      )
    }
  }

  const path = getPathFromSegments(params.paths)

  const data = await getPageData(path).catch(error => ({ type: 'error', error } as const))

  switch (data.type) {
    case 'error': {
      const { error } = data
      if (error instanceof NoAccessTokenError) {
        // If error includes 403 which means the user has not completed initial setup, redirect to OAuth page
        redirect('/onedrive-vercel-index-oauth/step-1')
      }
      throw error
    }
    case 'file':
      return <FilePreview {...data} path={path} />
    case 'folder':
      return <FolderView {...data} path={path} />
    default:
      return <NoItemHandlerError path={path} />
  }
}

function AuthWarpper({ redirect }: { redirect: string }) {
  const t = useTranslations('layout.auth')
  return (
    <Suspense fallback={<Loading loadingText="loading login page" />}>
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
    </Suspense>
  )
}

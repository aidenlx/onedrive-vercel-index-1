import { redirect } from 'next-intl/server'
import { getPageData } from './fetch'
import { getPathFromSegments } from '@/components/page/utils'
import FolderView from '@/components/page/folder/FolderView'
import FilePreview from '@/components/page/FilePreview'
import { NoAccessTokenError } from '@/utils/oauth/get-at'
import { NoItemHandlerError } from '@/components/Error'

export default async function Page({ params }: { params: { paths?: string[] } }) {
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

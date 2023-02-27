import Breadcrumb from '@/components/layout/Breadcrumb'
import SwitchLayout from '@/components/layout/SwitchLayout'
import { Auth } from '@/components/Auth'
import { queryToPath } from '@/components/page/utils'
import { PreviewContainer } from '@/components/previews/Containers'
import { authRoute } from '@/utils/auth/const'
import { useTranslations } from 'next-intl'
import { Suspense } from 'react'
import Loading from '@/components/Loading'

export default function Layout({ children, params }: { children: React.ReactNode; params: { paths?: string[] } }) {
  const t = useTranslations('layout.layouts')

  const paths = params.paths ?? []
  if (paths[0] === authRoute) {
    paths.shift()
    children = (
      <PreviewContainer>
        <AuthWarpper redirect={queryToPath(paths)} />
      </PreviewContainer>
    )
  }
  return (
    <>
      <nav className="mb-4 flex items-center justify-between space-x-3 px-4 sm:px-0 sm:pl-1">
        <Breadcrumb paths={paths} />
        <SwitchLayout msg={{ Grid: t('Grid'), List: t('List') }} />
      </nav>
      {children}
    </>
  )
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

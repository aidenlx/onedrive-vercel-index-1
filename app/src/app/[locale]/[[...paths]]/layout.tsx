import Breadcrumb from '@ui/layout/Breadcrumb'
import SwitchLayout from '@ui/layout/SwitchLayout'
import { useTranslations } from 'next-intl'
import { traverseFolder } from '@od/util/graph-api'
import arrayAsyncFrom from '@od/util/asyncFrom'
import getConfig from '@od/cfg/site'
import { Metadata } from 'next'

interface Params {
  paths?: string[]
}

export async function generateStaticParams(): Promise<Params[]> {
  if (process.env.NODE_ENV !== 'production') return []
  const files = await traverseFolder('/', Infinity)
  return await arrayAsyncFrom(files)
}

export const revalidate = 43200 // 12 hours

export const dynamic = 'force-static'

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  let {
    config: { title },
  } = await getConfig()

  const name = params.paths?.pop() ?? ''
  if (name) {
    title = [decodeURIComponent(name), title].join(' - ')
  }
  return { title }
}

export default function Layout({ children, params }: { children: React.ReactNode; params: { paths?: string[] } }) {
  const t = useTranslations('layout.layouts')

  const paths = params.paths ?? []
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

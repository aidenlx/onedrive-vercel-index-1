import Breadcrumb from '@/components/layout/Breadcrumb'
import Footer from '@/components/layout/Footer'
import Navbar from '@/components/layout/Navbar'
import { OpenSearch } from '@/components/layout/Navbar/OpenSearch'
import SwitchLang from '@/components/layout/Navbar/SwitchLang'
import { TokenPresent } from '@/components/layout/Navbar/Token'
import SwitchLayout from '@/components/layout/SwitchLayout'
import { Toaster } from '@/components/layout/Toaster'
import { fromPairs } from '@/utils/fromPair'
import { useTranslations } from 'next-intl'

export default function Layout({ children, params }: { children: React.ReactNode; params: { paths?: string[] } }) {
  const tBasic = useTranslations('layout.basic'),
    tLinks = useTranslations('layout.links'),
    tToken = useTranslations('layout.token'),
    tLayouts = useTranslations('layout.layouts'),
    tSearch = useTranslations('layout.search')
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-gray-900">
      <main className="flex w-full flex-1 flex-col bg-gray-50 dark:bg-gray-800">
        <Navbar
          label={{ email: tBasic('Email') }}
          msgLink={{ Weibo: tLinks('Weibo') }}
          right={
            <TokenPresent
              label={fromPairs(
                (
                  [
                    'Clear all tokens?',
                    'Clear all',
                    'Cleared all tokens',
                    'clearing them means that you will need to re-enter the passwords again',
                    'These tokens are used to authenticate yourself into password protected folders, ',
                    'Logout',
                    'Cancel',
                  ] as const
                ).map(x => [x, tToken(x)] as const)
              )}
            />
          }
        >
          <Toaster />
          <OpenSearch
            label={{
              searchFor: tSearch('Search'),
              error: tSearch('Error: '),
              loading: tBasic('Loading'),
              NothingHere: tSearch('Nothing here'),
            }}
          />
          <SwitchLang />
        </Navbar>
        <div className="mx-auto w-full max-w-5xl py-4 sm:p-4">
          <nav className="mb-4 flex items-center justify-between space-x-3 px-4 sm:px-0 sm:pl-1">
            <Breadcrumb paths={params.paths??[]} />
            <SwitchLayout
              msg={{
                Grid: tLayouts('Grid'),
                List: tLayouts('List'),
              }}
            />
          </nav>
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}

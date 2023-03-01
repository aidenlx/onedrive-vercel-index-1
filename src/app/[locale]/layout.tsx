import '@fortawesome/fontawesome-svg-core/styles.css'

import '../../styles/globals.css'
import '../../styles/markdown-github.css'

import { useLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { Inter as Sans, Fira_Mono as Mono } from '@next/font/google'

import type { Metadata } from 'next'
import { title } from '@cfg/site.config'

export const metadata: Metadata = {
  title,
  description: 'OneDrive Vercel Index',
}

const sans = Sans({
  variable: '--font-sans',
  display: 'swap',
})

const mono = Mono({
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '700'],
})

export default function RootLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  const locale = useLocale()
  // Show a 404 error if the user requests an unknown locale
  if (params.locale !== locale) {
    notFound()
  }
  return (
    <html lang={locale} className={`${sans.variable} ${mono.variable}`}>
      <body>
        <PWA />
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}

import Footer from '@/components/layout/Footer'
import Navbar from '@/components/layout/Navbar'
import { OpenSearch } from '@/components/layout/Navbar/OpenSearch'
import SwitchLang from '@/components/layout/Navbar/SwitchLang'
import { TokenPresent } from '@/components/Auth'
import { Toaster } from '@/components/layout/Toaster'
import { fromPairs } from '@/utils/fromPair'
import { useTranslations } from 'next-intl'
import { Suspense } from 'react'
import PWA from './pwa'

function Layout({ children }: { children: React.ReactNode }) {
  const tBasic = useTranslations('layout.basic'),
    tLinks = useTranslations('layout.links'),
    tToken = useTranslations('layout.token'),
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
          <Suspense>
            <SwitchLang />
          </Suspense>
        </Navbar>
        <div className="mx-auto w-full max-w-5xl py-4 sm:p-4">{children}</div>
      </main>
      <Footer />
    </div>
  )
}

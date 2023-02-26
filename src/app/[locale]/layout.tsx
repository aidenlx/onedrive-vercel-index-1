import '@fortawesome/fontawesome-svg-core/styles.css'

import '../../styles/globals.css'
import '../../styles/markdown-github.css'

import { useLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { Inter as Sans, Fira_Mono as Mono } from 'next/font/google'

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
      <body>{children}</body>
    </html>
  )
}

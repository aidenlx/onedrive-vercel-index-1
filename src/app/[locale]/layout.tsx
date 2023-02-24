import '@fortawesome/fontawesome-svg-core/styles.css'

import '../../styles/globals.css'
import '../../styles/markdown-github.css'

import { useLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import FontAwesomeLoader from './fa'

export default function RootLayout({ children, params }: { children: React.ReactNode; params: { locale: string } }) {
  const locale = useLocale()
  // Show a 404 error if the user requests an unknown locale
  if (params.locale !== locale) {
    notFound()
  }
  return (
    <html lang={locale}>
      <FontAwesomeLoader/>
      <body>{children}</body>
    </html>
  )
}

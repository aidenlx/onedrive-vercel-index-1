import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../public/locales/${locale}.json`)).default,
}))

declare global {
  type Messages = typeof import('../public/locales/en.json')
  interface IntlMessages extends Messages {}
}

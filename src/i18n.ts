import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../locales/${locale}.json`)).default,
}))

declare global {
  type Messages = typeof import('../locales/en.json')
  interface IntlMessages extends Messages {}
}

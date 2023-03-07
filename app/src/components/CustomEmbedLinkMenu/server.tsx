import { useTranslations } from 'next-intl'

export interface CustomEmbedLinkMenuLabels {
  Filename: string
  Default: string
  'URL encoded': string
  Customised: string
  'Customised and encoded': string
  'Customise direct link': string
  'Change the raw file direct link to a URL ending with the extension of the file': string
  'What is this?': string
}

export function useCustomEmbedLinkMenuLabels(): CustomEmbedLinkMenuLabels {
  const t = useTranslations('customLink')
  return {
    Filename: t('Filename'),
    Default: t('Default'),
    'URL encoded': t('URL encoded'),
    Customised: t('Customised'),
    'Customised and encoded': t('Customised and encoded'),
    'Customise direct link': t('Customise direct link'),
    'Change the raw file direct link to a URL ending with the extension of the file': t(
      'Change the raw file direct link to a URL ending with the extension of the file'
    ),
    'What is this?': t('What is this?'),
  }
}

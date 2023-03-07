import FourOhFour from './FourOhFour'
import { PreviewContainer } from './layout/Containers'
import { useTranslations } from 'next-intl'

export function NoItemHandlerError({ path }: { path: string }) {
  const t = useTranslations('fof')
  return (
    <PreviewContainer>
      <FourOhFour>{t('Cannot preview {{path}}', { path })}</FourOhFour>
    </PreviewContainer>
  )
}

export function EmptyFileError({ path }: { path: string }) {
  const t = useTranslations('fof')
  return (
    <PreviewContainer>
      <FourOhFour>{t('File {name} is empty', { name: path.split('/').pop() })}</FourOhFour>
    </PreviewContainer>
  )
}



import Loading from '@/components/Loading'
import { PreviewContainer } from '@/components/previews/Containers'
import { useTranslations } from 'next-intl'

export default function LoadingPage() {
  const t = useTranslations('layout.basic')
  return (
    <PreviewContainer>
      <Loading loadingText={t('Loading')} />
    </PreviewContainer>
  )
}

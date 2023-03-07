import { useCustomEmbedLinkMenuLabels } from './CustomEmbedLinkMenu'
import { useTranslations } from 'next-intl'
import { DownloadActions } from './DownloadButton'
import { PropsWithChildren } from 'react'

const DownloadButtonGroup = ({ path, children }: PropsWithChildren<{ path: string }>) => {
  const t = useTranslations('downloadBtn'),
    labels = useCustomEmbedLinkMenuLabels()

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <DownloadActions
        label={{
          Download: t('Download'),
          'Copy direct link': t('Copy direct link'),
          'Copied direct link to clipboard': t('Copied direct link to clipboard'),
          'Copy the permalink to the file to the clipboard': t('Copy the permalink to the file to the clipboard'),
          'Customise link': t('Customise link'),
          'Download the file directly through OneDrive': t('Download the file directly through OneDrive'),
          ...labels,
        }}
        path={path}
      >
        {children}
      </DownloadActions>
    </div>
  )
}

export default DownloadButtonGroup

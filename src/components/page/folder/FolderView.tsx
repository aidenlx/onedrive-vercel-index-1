import { FolderData } from '@/utils/api/type'
import LoadMore from './LoadMore'
import { useTranslations } from 'next-intl'
// import MarkdownPreview from '@/components/previews/MarkdownPreview'
import FolderLayout from './FolderLayout'
import FolderListLayout from '../folder-layout/FolderListLayout'
import FolderGridLayout from '../folder-layout/FolderGridLayout'
import { ActionLabels } from '../folder-layout/Actions'

export default function FolderView({
  value: folderChildren,
  canLoadMore,
  size,
  path,
  token,
}: FolderData & { size: number; path: string; token: string | null }) {
  const onlyOnePage = size === 0 && !canLoadMore

  // Find README.md file to render
  const readmeFile = folderChildren.find(c => c.name.toLowerCase() === 'readme.md')

  const t = useTranslations('folder.actions')

  const actionLabels: ActionLabels = {
    copyFile: t('Copied raw file permalink'),
    copyFolder: t('Copy folder permalink'),
    copySelected: t('Copy selected files permalink'),
    cpFileDone: t('Copied raw file permalink'),
    cpFolderDone: t('Copied folder permalink'),
    cpSelectedDone: t('Copied selected files permalink'),
    downloadFile: t('Download file'),
    downloadFolder: t('Download folder'),
    downloadSelected: t('Download selected files'),
    dlFolderPending: t('Downloading folder, refresh page to cancel'),
    dlSelectedPending: t('Downloading selected files, refresh page to cancel'),
    selectAll: t('Select files'),
    selectFile: t('Select file'),
  }

  return (
    <>
      <FolderLayout
        list={<FolderListLayout folderChildren={folderChildren} path={path} label={actionLabels} />}
        grid={<FolderGridLayout folderChildren={folderChildren} path={path} token={token} label={actionLabels} />}
      />
      {!onlyOnePage && <LoadMoreWarpper canLoadMore={canLoadMore} size={size} total={folderChildren.length} />}
      {readmeFile && (
        <div className="mt-4">
          markdown file
          {/* <MarkdownPreview file={readmeFile} path={path} standalone={false} /> */}
        </div>
      )}
    </>
  )
}

function LoadMoreWarpper({ size, total, canLoadMore }: { size: number; total: number; canLoadMore: boolean }) {
  const t = useTranslations('folder.loadMore')
  return (
    <LoadMore
      label={{
        count: t('- showing {size} page(s) of {total} file(s) -', { size: size + 1, total }),
        countLoading: t('- showing {size} page(s) of {total} file(s) -', { size: size + 2, total: -1 }),
        loading: t('Loading'),
        loadMore: t('Load more'),
        noMore: t('No more files'),
      }}
      size={size}
      canLoadMore={canLoadMore}
    />
  )
}

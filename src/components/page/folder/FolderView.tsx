import { FolderData } from '@/utils/api/type'
import MarkdownPreview from '@/components/previews/TextPreviews/Markdown'
import FolderLayout from './FolderLayout'
import FolderListLayout from '../folder-layout/FolderListLayout'
import FolderGridLayout from '../folder-layout/FolderGridLayout'
import { join } from '@/utils/path'

export default function FolderView({ value: folderChildren, path }: FolderData & { path: string }) {
  // const onlyOnePage = size === 0 && !canLoadMore

  // Find README.md file to render
  const readmeFile = folderChildren.find(c => c.name.toLowerCase() === 'readme.md')

  return (
    <>
      <FolderLayout
        list={<FolderListLayout folderChildren={folderChildren} path={path} />}
        grid={<FolderGridLayout folderChildren={folderChildren} path={path} />}
      />
      {/* {!onlyOnePage && <LoadMoreWarpper canLoadMore={canLoadMore} size={size} total={folderChildren.length} />} */}
      {readmeFile && (
        <div className="mt-4">{<MarkdownPreview path={join(path, readmeFile.name)} standalone={false} />}</div>
      )}
    </>
  )
}

// function LoadMoreWarpper({ size, total, canLoadMore }: { size: number; total: number; canLoadMore: boolean }) {
//   const t = useTranslations('folder.loadMore')
//   return (
//     <Suspense>
//       <LoadMore
//         label={{
//           count: t('- showing {size} page(s) of {total} file(s) -', { size: size + 1, total }),
//           countLoading: t('- showing {size} page(s) of {total} file(s) -', { size: size + 2, total: -1 }),
//           loading: t('Loading'),
//           loadMore: t('Load more'),
//           noMore: t('No more files'),
//         }}
//         size={size}
//         canLoadMore={canLoadMore}
//       />
//     </Suspense>
//   )
// }

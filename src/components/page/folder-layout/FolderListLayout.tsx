import FileListItem from './FileListItem'
import { DriveItem } from '@/utils/api/type'
import { useTranslations, Link } from 'next-intl'
import { ActionLabels, BatchAction, FileAction, FolderAction, ItemSelectionList } from './Actions'
import { itemPathGetter } from '../utils'

export default function FolderListLayout({
  path,
  folderChildren,
  label,
}: {
  path: string
  folderChildren: DriveItem[]
  label: ActionLabels
}) {
  const t = useTranslations('folder.list')
  const getItemPath = itemPathGetter(path)
  return (
    <div className="rounded bg-white shadow-sm dark:bg-gray-900 dark:text-gray-100">
      <div className="grid grid-cols-12 items-center space-x-2 border-b border-gray-900/10 px-3 dark:border-gray-500/30">
        <div className="col-span-12 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 md:col-span-6">
          {t('Name')}
        </div>
        <div className="col-span-3 hidden text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 md:block">
          {t('Last Modified')}
        </div>
        <div className="hidden text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 md:block">
          {t('Size')}
        </div>
        <div className="hidden text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 md:block">
          {t('Actions')}
        </div>
        <div className="hidden text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 md:block">
          <div className="hidden p-1.5 text-gray-700 dark:text-gray-400 md:flex">
            <BatchAction folderChildren={folderChildren} path={path} label={label} />
          </div>
        </div>
      </div>

      {folderChildren.map(c => (
        <div
          className="grid grid-cols-12 transition-all duration-100 hover:bg-gray-100 dark:hover:bg-gray-850"
          key={c.id}
        >
          <Link href={getItemPath(c.name)} passHref className="col-span-12 md:col-span-10">
            <FileListItem fileContent={c} />
          </Link>
          <div className="hidden p-1.5 text-gray-700 dark:text-gray-400 md:flex">
            {c.folder ? (
              <FolderAction c={c} path={path} label={label} />
            ) : (
              <FileAction c={c} path={path} label={label} />
            )}
          </div>
          <ItemSelectionList c={c} label={label} />
        </div>
      ))}
    </div>
  )
}

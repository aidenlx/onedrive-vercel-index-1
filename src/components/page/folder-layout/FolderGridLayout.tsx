import GridItem from './GridItem'
import { useTranslations, Link } from 'next-intl'
import { DriveItem } from '@/utils/api/type'
import { BatchAction, FileAction, FolderAction, ItemSelectionGrid } from './Actions'
import type { ActionLabels } from './Actions'
import { itemPathGetter } from '../utils'

export default function FolderGridLayout({
  path,
  folderChildren,
  label,
}: {
  path: string
  folderChildren: DriveItem[]
  label: ActionLabels
}) {
  const t = useTranslations('folder.grid')
  const getItemPath = itemPathGetter(path)

  return (
    <div className="rounded bg-white shadow-sm dark:bg-gray-900 dark:text-gray-100">
      <div className="flex items-center border-b border-gray-900/10 px-3 text-xs font-bold uppercase tracking-widest text-gray-600 dark:border-gray-500/30 dark:text-gray-400">
        <div className="flex-1">{t('{{count}} item(s)', { count: folderChildren.length })}</div>
        <div className="flex p-1.5 text-gray-700 dark:text-gray-400">
          <BatchAction folderChildren={folderChildren} path={path} label={label} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-3 md:grid-cols-4">
        {folderChildren.map(c => (
          <div
            key={c.id}
            className="group relative overflow-hidden rounded transition-all duration-100 hover:bg-gray-100 dark:hover:bg-gray-850"
          >
            <div className="absolute top-0 right-0 z-10 m-1 rounded bg-white/50 py-0.5 opacity-0 transition-all duration-100 group-hover:opacity-100 dark:bg-gray-900/50">
              <div>
                {c.folder ? (
                  <FolderAction c={c} path={path} label={label} />
                ) : (
                  <FileAction c={c} path={path} label={label} />
                )}
              </div>
            </div>
            <ItemSelectionGrid c={c} label={label} />
            <Link href={getItemPath(c.name)} passHref>
              <GridItem c={c} path={getItemPath(c.name)} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

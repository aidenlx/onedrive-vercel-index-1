import GridItem from './GridItem'
import { useTranslations } from 'next-intl'
import { Link } from 'next-intl'
import { DriveItem } from '@od/util/graph-api/type'
import { ItemSelectionGrid } from './actions/ItemSelection'
import { FileAction } from './actions/FileAction'
import { FolderAction } from './actions/FolderAction'
import { BatchAction } from './actions/BatchAction'
import { itemPathGetter } from '@ui/utils/page'
import {
  useBatchActionLabels,
  useFileActionLabels,
  useFolderActionLabels,
  useItemSelectionLabels,
} from './actions/use-actions'

export default function FolderGridLayout({ path, folderChildren }: { path: string; folderChildren: DriveItem[] }) {
  const t = useTranslations('folder.grid')
  const {
    config: { datetimeFormat },
  } = {
    config: {
      datetimeFormat: 'YYYY-MM-DD HH:mm',
    },
  }
  const getItemPath = itemPathGetter(path)
  const lFolder = useFolderActionLabels()
  const lFile = useFileActionLabels()
  const lSelect = useItemSelectionLabels()
  return (
    <div className="rounded bg-white shadow-sm dark:bg-gray-900 dark:text-gray-100">
      <div className="flex items-center border-b border-gray-900/10 px-3 text-xs font-bold uppercase tracking-widest text-gray-600 dark:border-gray-500/30 dark:text-gray-400">
        <div className="flex-1">{t('{{count}} item(s)', { count: folderChildren.length })}</div>
        <div className="flex p-1.5 text-gray-700 dark:text-gray-400">
          <BatchAction folderChildren={folderChildren} path={path} label={useBatchActionLabels()} />
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
                  <FolderAction c={c} path={path} label={lFolder} />
                ) : (
                  <FileAction c={c} path={path} label={lFile} />
                )}
              </div>
            </div>
            <ItemSelectionGrid c={c} label={lSelect} />
            <Link href={getItemPath(c.name)} passHref>
              <GridItem c={c} path={getItemPath(c.name)} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

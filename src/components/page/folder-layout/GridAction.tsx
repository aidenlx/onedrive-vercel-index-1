'use client'

import { DriveItem } from '@/utils/api/type'

export function BatchAction() {
  return (
    <>
      <Checkbox
        checked={totalSelected}
        onChange={toggleTotalSelected}
        indeterminate={true}
        title={t('Select all files')}
      />
      <button
        title={t('Copy selected files permalink')}
        className="cursor-pointer rounded p-1.5 hover:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-white dark:hover:bg-gray-600 disabled:dark:text-gray-600 disabled:hover:dark:bg-gray-900"
        disabled={totalSelected === 0}
        onClick={() => {
          clipboard.copy(handleSelectedPermalink(getBaseUrl()))
          toast.success(t('Copied selected files permalink.'))
        }}
      >
        <FontAwesomeIcon icon={['far', 'copy']} size="lg" />
      </button>
      {totalGenerating ? (
        <Downloading title={t('Downloading selected files, refresh page to cancel')} style="p-1.5" />
      ) : (
        <button
          title={t('Download selected files')}
          className="cursor-pointer rounded p-1.5 hover:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-white dark:hover:bg-gray-600 disabled:dark:text-gray-600 disabled:hover:dark:bg-gray-900"
          disabled={totalSelected === 0}
          onClick={handleSelectedDownload}
        >
          <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} size="lg" />
        </button>
      )}
    </>
  )
}

export function FolderAction() {
  return (
    <>
      <span
        title={t('Copy folder permalink')}
        className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
        onClick={() => {
          clipboard.copy(`${getBaseUrl()}${getItemPath(c.name)}`)
          toast(t('Copied folder permalink.'), { icon: '👌' })
        }}
      >
        <FontAwesomeIcon icon={['far', 'copy']} />
      </span>
      {folderGenerating[c.id] ? (
        <Downloading title={t('Downloading folder, refresh page to cancel')} style="px-1.5 py-1" />
      ) : (
        <span
          title={t('Download folder')}
          className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
          onClick={handleFolderDownload(getItemPath(c.name), c.id, c.name)}
        >
          <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} />
        </span>
      )}
    </>
  )
}

export function FileAction() {
  return (
    <>
      <span
        title={t('Copy raw file permalink')}
        className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
        onClick={() => {
          clipboard.copy(
            `${getBaseUrl()}/api/raw/?path=${getItemPath(c.name)}${hashedToken ? `&odpt=${hashedToken}` : ''}`
          )
          toast.success(t('Copied raw file permalink.'))
        }}
      >
        <FontAwesomeIcon icon={['far', 'copy']} />
      </span>
      <a
        title={t('Download file')}
        className="cursor-pointer rounded px-1.5 py-1 hover:bg-gray-300 dark:hover:bg-gray-600"
        href={`${getBaseUrl()}/api/raw/?path=${getItemPath(c.name)}${hashedToken ? `&odpt=${hashedToken}` : ''}`}
      >
        <FontAwesomeIcon icon={['far', 'arrow-alt-circle-down']} />
      </a>
    </>
  )
}

export function ItemSelection({ c }: { c: DriveItem }) {
  return (
    <div
      className={}
    >
      {!c.folder && !(c.name === '.password') && (
        <Checkbox checked={selected[c.id] ? 2 : 0} onChange={() => toggleItemSelected(c.id)} title={t('Select file')} />
      )}
    </div>
  )
}

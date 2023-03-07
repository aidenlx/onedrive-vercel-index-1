'use client'

import useSWR, { SWRResponse } from 'swr'
import { Fragment, useState } from 'react'
import AwesomeDebouncePromise from 'awesome-debounce-promise'
import { useAsync } from 'react-async-hook'
import useConstant from 'use-constant'

import { Link } from 'next-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Dialog, Transition } from '@headlessui/react'

import { LoadingIcon } from '@ui/Loading'

import { getFileIcon } from '@ui/utils/getFileIcon'
import { faFolder } from '@fortawesome/free-regular-svg-icons'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { baseDirectory } from '@od/cfg/api'
import { DriveItemSearch } from '@od/util/graph-api/type'

/**
 * Extract the searched item's path in field 'parentReference' and convert it to the
 * absolute path represented in onedrive-vercel-index
 *
 * @param path Path returned from the parentReference field of the driveItem
 * @returns The absolute path of the driveItem in the search result
 */
function mapAbsolutePath(path: string): string {
  // path is in the format of '/drive/root:/path/to/file', if baseDirectory is '/' then we split on 'root:',
  // otherwise we split on the user defined 'baseDirectory'
  const absolutePath = path.split(baseDirectory === '/' ? 'root:' : baseDirectory)
  // path returned by the API may contain #, by doing a decodeURIComponent and then encodeURIComponent we can
  // replace URL sensitive characters such as the # with %23
  return absolutePath.length > 1 // solve https://github.com/spencerwooo/onedrive-vercel-index/issues/539
    ? absolutePath[1]
        .split('/')
        .map(p => encodeURIComponent(decodeURIComponent(p)))
        .join('/')
    : ''
}

function toPath(item: DriveItemSearch) {
  if (item.name && item.parentReference?.path)
    // OneDrive International have the path returned in the parentReference field
    return `${mapAbsolutePath(item.parentReference.path)}/${encodeURIComponent(item.name)}`
  // OneDrive for Business/Education does not, so we need extra steps here
  return ''
}

type SearchResult = DriveItemSearch & {
  path: string
}

/**
 * Implements a debounced search function that returns a promise that resolves to an array of
 * search results.
 *
 * @returns A react hook for a debounced async search of the drive
 */
function useDriveItemSearch() {
  const [query, setQuery] = useState('')
  const searchDriveItem = async (q: string) => {
    const data: DriveItemSearch[] = await fetch(`/api/search/?q=${q}`).then(res => res.json())

    // Map parentReference to the absolute path of the search result
    return data.map(
      (item): SearchResult => ({
        ...item,
        path: toPath(item),
      })
    )
  }

  const debouncedDriveItemSearch = useConstant(() => AwesomeDebouncePromise(searchDriveItem, 1000))
  const results = useAsync(async () => {
    if (query.length === 0) {
      return []
    } else {
      return debouncedDriveItemSearch(query)
    }
  }, [query])

  return {
    query,
    setQuery,
    results,
  }
}

function SearchResultItemTemplate({
  driveItem,
  driveItemPath,
  itemDescription,
  disabled,
}: {
  driveItem: SearchResult
  driveItemPath: string
  itemDescription: string
  disabled: boolean
}) {
  return (
    <Link
      href={driveItemPath}
      passHref
      className={`flex items-center space-x-4 border-b border-gray-400/30 px-4 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-850 ${
        disabled ? 'pointer-events-none cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <FontAwesomeIcon icon={driveItem.file ? getFileIcon(driveItem.name ?? '') : faFolder} />
      <div>
        <div className="text-sm font-medium leading-8">{driveItem.name}</div>
        <div
          className={`overflow-hidden truncate font-mono text-xs opacity-60 ${
            itemDescription === 'Loading ...' && 'animate-pulse'
          }`}
        >
          {itemDescription}
        </div>
      </div>
    </Link>
  )
}

function SearchResultItemLoadRemote({ result, label }: { result: SearchResult; label: { loading: string } }) {
  const { data, error }: SWRResponse<DriveItemSearch, { status: number; message: any }> = useSWR(
    `/api/item/?id=${result.id}`,
    url => fetch(url).then(res => res.json())
  )

  if (error) {
    return (
      <SearchResultItemTemplate
        driveItem={result}
        driveItemPath={''}
        itemDescription={typeof error.message?.error === 'string' ? error.message.error : JSON.stringify(error.message)}
        disabled={true}
      />
    )
  }
  if (!data) {
    return (
      <SearchResultItemTemplate driveItem={result} driveItemPath={''} itemDescription={label.loading} disabled={true} />
    )
  }

  const driveItemPath = toPath(data)
  return (
    <SearchResultItemTemplate
      driveItem={result}
      driveItemPath={driveItemPath}
      itemDescription={decodeURIComponent(driveItemPath)}
      disabled={false}
    />
  )
}

function SearchResultItem({ result, label }: { result: SearchResult; label: { loading: string } }) {
  if (result.path === '') {
    // path is empty, which means we need to fetch the parentReference to get the path
    return <SearchResultItemLoadRemote result={result} label={label} />
  } else {
    // path is not an empty string in the search result, such that we can directly render the component as is
    const driveItemPath = decodeURIComponent(result.path)
    return (
      <SearchResultItemTemplate
        driveItem={result}
        driveItemPath={result.path}
        itemDescription={driveItemPath}
        disabled={false}
      />
    )
  }
}

export type SearchModalLabels = Record<'searchFor' | 'loading' | 'NothingHere' | 'error', string>

export default function SearchModal({
  label,
  searchOpen,
  onClose,
}: {
  label: SearchModalLabels
  searchOpen: boolean
  onClose: () => void
}) {
  const { query, setQuery, results } = useDriveItemSearch()

  const closeSearchBox = () => {
    onClose()
    setQuery('')
  }

  return (
    <Transition appear show={searchOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-[200] overflow-y-auto" onClose={closeSearchBox}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-100"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-white/80 dark:bg-gray-800/80" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-100"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="my-12 inline-block w-full max-w-3xl transform overflow-hidden rounded border border-gray-400/30 text-left shadow-xl transition-all">
              <Dialog.Title
                as="h3"
                className="flex items-center space-x-4 border-b border-gray-400/30 bg-gray-50 p-4 dark:bg-gray-800 dark:text-white"
              >
                <FontAwesomeIcon icon={faSearch} className="h-4 w-4" />
                <input
                  type="text"
                  id="search-box"
                  className="w-full bg-transparent focus:outline-none focus-visible:outline-none"
                  placeholder={label.searchFor}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                />
                <div className="rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium dark:bg-gray-700">ESC</div>
              </Dialog.Title>
              <div
                className="max-h-[80vh] overflow-x-hidden overflow-y-scroll bg-white dark:bg-gray-900 dark:text-white"
                onClick={closeSearchBox}
              >
                {results.loading && (
                  <div className="px-4 py-12 text-center text-sm font-medium">
                    <LoadingIcon className="svg-inline--fa mr-2 inline-block h-4 w-4 animate-spin" />
                    <span>{label.loading}</span>
                  </div>
                )}
                {results.error && (
                  <div className="px-4 py-12 text-center text-sm font-medium">
                    {`${label.error} ${results.error.message}`}
                  </div>
                )}
                {results.result && (
                  <>
                    {results.result.length === 0 ? (
                      <div className="px-4 py-12 text-center text-sm font-medium">{label.NothingHere}</div>
                    ) : (
                      results.result.map(result => <SearchResultItem key={result.id} result={result} label={label} />)
                    )}
                  </>
                )}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
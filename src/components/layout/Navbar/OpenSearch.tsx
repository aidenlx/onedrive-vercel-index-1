'use client'

import useDeviceOS from '@/utils/useDeviceOS'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import SearchModal from './SearchModal'
import type { SearchModalLabels } from './SearchModal'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

export function OpenSearch({ label }: { label: SearchModalLabels }) {
  const os = useDeviceOS()

  const [searchOpen, setSearchOpen] = useState(false)

  const onOpen = () => setSearchOpen(true)

  useHotkeys(`${os === 'mac' ? 'meta' : 'ctrl'}+k`, e => {
    onOpen()
    e.preventDefault()
  })

  return (
    <>
      <button
        className="flex flex-1 items-center justify-between rounded-lg bg-gray-100 px-2.5 py-1.5 hover:opacity-80 dark:bg-gray-800 dark:text-white md:w-48"
        onClick={onOpen}
      >
        <div className="flex items-center space-x-2">
          <FontAwesomeIcon className="h-4 w-4" icon={faSearch} />
          <span className="truncate text-sm font-medium">{label.searchFor}</span>
        </div>

        <div className="hidden items-center space-x-1 md:flex">
          <div className="rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium dark:bg-gray-700">
            {os === 'mac' ? '⌘' : 'Ctrl'}
          </div>
          <div className="rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium dark:bg-gray-700">K</div>
        </div>
      </button>
      <SearchModal searchOpen={searchOpen} onClose={() => setSearchOpen(false)} label={label} />
    </>
  )
}

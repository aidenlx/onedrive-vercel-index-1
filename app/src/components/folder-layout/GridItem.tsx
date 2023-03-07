'use client'

import { useState } from 'react'
import { DriveItem } from '@od/util/graph-api/type'
import ChildIcon from './ChildIcon'
import ChildName from './ChildName'
import DateTime from '../DateTime'

export default function GridItem({ c, path }: { c: DriveItem; path: string }) {
  // We use the generated medium thumbnail for rendering preview images (excluding folders)

  const params = new URLSearchParams()
  params.append('path', path)
  params.append('size', 'medium')
  // if (token) params.append('odpt', token)
  const thumbnailUrl = 'folder' in c ? null : `/api/thumbnail/?${params.toString()}`

  // Some thumbnails are broken, so we check for onerror event in the image component
  const [brokenThumbnail, setBrokenThumbnail] = useState(false)

  return (
    <div className="space-y-2">
      <div className="h-32 overflow-hidden rounded border border-gray-900/10 dark:border-gray-500/30">
        {thumbnailUrl && !brokenThumbnail ? (
          // eslint-disable-next-line next/next/no-img-element
          <img
            className="h-full w-full object-cover object-top"
            src={thumbnailUrl}
            alt={c.name}
            onError={() => setBrokenThumbnail(true)}
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center rounded-lg">
            <ChildIcon child={c} />
            <span className="absolute bottom-0 right-0 m-1 font-medium text-gray-700 dark:text-gray-500">
              {c.folder?.childCount}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-start justify-center space-x-2">
        <span className="w-5 flex-shrink-0 text-center">
          <ChildIcon child={c} />
        </span>
        <ChildName name={c.name} folder={Boolean(c.folder)} />
      </div>
      <div className="truncate text-center font-mono text-xs text-gray-700 dark:text-gray-500">
        <DateTime value={c.lastModifiedDateTime} />
      </div>
    </div>
  )
}

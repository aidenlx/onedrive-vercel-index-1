'use client'

import { LoadingIcon } from '@/components/Loading'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'

export default function LoadMore({
  size,
  canLoadMore,
  label,
}: {
  size: number
  canLoadMore: boolean
  label: LoadedStatusLabels & LoadMoreButtonLabels
}) {
  const [loading, loadMore] = useLoadMore(size)
  return (
    <div className="rounded-b bg-white dark:bg-gray-900 dark:text-gray-100">
      <LoadedStatus loading={loading} label={label} />
      <LoadMoreButton loading={loading} canLoadMore={canLoadMore} onClick={loadMore} label={label} />
    </div>
  )
}

interface LoadedStatusLabels {
  count: string
  countLoading: string
}

function LoadedStatus({ label, loading }: { label: LoadedStatusLabels; loading: boolean }) {
  return (
    <div className="border-b border-gray-200 p-3 text-center font-mono text-sm text-gray-400 dark:border-gray-700">
      {loading ? label.countLoading : label.count}
    </div>
  )
}

function useLoadMore(size: number) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const path = usePathname()
  const search = useSearchParams()
  function handleClick() {
    startTransition(() => {
      // Refresh the current route and fetch new data from the server without
      // losing client-side browser or React state.
      const newSearch = new URLSearchParams(search ?? undefined)
      newSearch.set('size', String(size + 1))
      router.push(`${path}?${newSearch.toString()}`)
    })
  }
  return [isPending, handleClick] as const
}

interface LoadMoreButtonLabels {
  loading: string
  noMore: string
  loadMore: string
}

function LoadMoreButton({
  loading,
  canLoadMore,
  onClick,
  label,
}: {
  loading: boolean
  canLoadMore: boolean
  onClick: () => void
  label: LoadMoreButtonLabels
}) {
  const disabled = loading || !canLoadMore
  return (
    <button
      className={`flex w-full items-center justify-center space-x-2 p-3 disabled:cursor-not-allowed ${
        disabled ? 'opacity-60' : 'hover:bg-gray-100 dark:hover:bg-gray-850'
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {loading ? (
        <>
          <LoadingIcon className="inline-block h-4 w-4 animate-spin" />
          <span>{label.loading}</span>{' '}
        </>
      ) : !canLoadMore ? (
        <span>{label.noMore}</span>
      ) : (
        <>
          <span>{label.loadMore}</span>
          <FontAwesomeIcon icon="chevron-circle-down" />
        </>
      )}
    </button>
  )
}

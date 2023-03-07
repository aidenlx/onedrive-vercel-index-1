'use client'
import { useRouter } from 'next-intl/client'
import { toast } from 'react-hot-toast'

export interface DownloadingToastLabels {
  dlProgress: string
  dlCancel: string
  dlFailed: string
  dlDone: string
}

/**
 * A loading toast component with file download progress support
 * @param props
 * @param props.router Next router instance, used for reloading the page
 * @param props.progress Current downloading and compression progress (returned by jszip metadata)
 */

export function DownloadingToast({ progress, label }: { progress?: string; label: DownloadingToastLabels }) {
  const router = useRouter()
  return (
    <div className="flex items-center space-x-2">
      <div className="w-56">
        <span>{`${label.dlProgress} ${progress}%`}</span>

        <div className="relative mt-2">
          <div className="flex h-1 overflow-hidden rounded bg-gray-100">
            <div style={{ width: `${progress}%` }} className="bg-gray-500 text-white transition-all duration-100"></div>
          </div>
        </div>
      </div>
      <button
        className="rounded bg-red-500 p-2 text-white hover:bg-red-400 focus:outline-none focus:ring focus:ring-red-300"
        onClick={() => router.refresh()}
      >
        {label.dlCancel}
      </button>
    </div>
  )
}

export function getDownloadEventHandlers(label: DownloadingToastLabels) {
  let toastId: string | undefined
  return {
    onStart: () => {
      toastId = toast.loading(<DownloadingToast label={label} />)
    },
    onProgress: (loaded: number, total: number) => {
      toast.loading(<DownloadingToast progress={((loaded / total) * 100).toFixed(2)} label={label} />, {
        id: toastId,
      })
    },
    onSuccess: () => {
      toast.success(label.dlDone, { id: toastId })
    },
    onError: (err: unknown) => {
      toast.error(label.dlFailed, { id: toastId })
      console.error(err)
    },
  }
}

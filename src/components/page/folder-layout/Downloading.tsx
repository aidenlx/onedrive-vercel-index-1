import { LoadingIcon } from '@/components/Loading'

export default function Downloading({ title, style }: { title: string; style: string }) {
  return (
    <span title={title} className={`${style} rounded`} role="status">
      <LoadingIcon
        // Use fontawesome far theme via class `svg-inline--fa` to get style `vertical-align` only
        // for consistent icon alignment, as class `align-*` cannot satisfy it
        className="svg-inline--fa inline-block h-4 w-4 animate-spin"
      />
    </span>
  )
}

import { toPermLink } from "@od/util/permlink"
import { DownloadBtnContainer } from '@ui/layout/Containers'
import DownloadButtonGroup from '@ui/DownloadBtnGtoup'
import Viewer from './lazy'

export default function OfficePreview({ path }: { path: string }) {
  return (
    <div>
      <Viewer src={toPermLink(path)} />
      <DownloadBtnContainer>
        <DownloadButtonGroup path={path} />
      </DownloadBtnContainer>
    </div>
  )
}

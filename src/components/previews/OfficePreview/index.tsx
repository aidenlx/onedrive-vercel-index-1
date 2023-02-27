import { toPermLink } from "@/utils/permlink"
import { DownloadBtnContainer } from '../Containers'
import DownloadButtonGroup from '@/components/DownloadBtnGtoup'
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

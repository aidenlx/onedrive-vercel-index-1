import { toPermLink } from "@/utils/permlink-server"
import { useToken } from '@/utils/useToken'
import { DownloadBtnContainer } from '../Containers'
import DownloadButtonGroup from '@/components/DownloadBtnGtoup'
import Viewer from './lazy'

export default function OfficePreview({ path }: { path: string }) {
  const hashedToken = useToken(path)
  return (
    <div>
      <Viewer src={toPermLink(path, hashedToken)} />
      <DownloadBtnContainer>
        <DownloadButtonGroup path={path} />
      </DownloadBtnContainer>
    </div>
  )
}

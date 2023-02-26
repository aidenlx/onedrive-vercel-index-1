import { toPermLink } from "@/utils/permlink-server"
import { useToken } from '@/utils/useToken'
import { DownloadBtnContainer } from '../Containers'
import DownloadButtonGroup from '@/components/DownloadBtnGtoup'
import { OfficeViewer } from './client'

export default function EPUBPreview({ path }: { path: string }) {
  const hashedToken = useToken(path)
  return (
    <div>
      <OfficeViewer src={toPermLink(path, hashedToken)} />
      <DownloadBtnContainer>
        <DownloadButtonGroup path={path} />
      </DownloadBtnContainer>
    </div>
  )
}

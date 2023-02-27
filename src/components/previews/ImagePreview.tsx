import { PreviewContainer, DownloadBtnContainer } from './Containers'
import DownloadButtonGroup from '../DownloadBtnGtoup'
import { toPermLink } from "@/utils/permlink"
import { DriveItem } from '@/utils/api/type'
import Image from 'next/image'

const ImagePreview = ({ file, path }: { file: DriveItem; path: string }) => {
  if (!file.image) return null

  return (
    <>
      <PreviewContainer>
        {file.image.height && file.image.width ? (
          <Image
            className="mx-auto"
            src={toPermLink(path)}
            alt={file.name}
            width={file.image.width}
            height={file.image.height}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="mx-auto" src={toPermLink(path)} alt={file.name} />
        )}
      </PreviewContainer>
      <DownloadBtnContainer>
        <DownloadButtonGroup path={path} />
      </DownloadBtnContainer>
    </>
  )
}

export default ImagePreview

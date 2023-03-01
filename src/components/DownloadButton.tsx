'use client'

import { MouseEventHandler, PropsWithChildren, ReactNode, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import Image, { StaticImageData } from 'next/image'
import { useClipboard } from 'use-clipboard-copy'
import { toast } from 'react-hot-toast'
import type { CustomEmbedLinkMenuLabels } from './page/CustomEmbedLinkMenu'
import CustomEmbedLinkMenu from './page/CustomEmbedLinkMenu'
import { toPermLink } from '@/utils/permlink'
import { Dialog } from '@headlessui/react'
import { faFileDownload, faPen } from '@fortawesome/free-solid-svg-icons'
import { faCopy } from '@fortawesome/free-regular-svg-icons'
import { useSealedURL } from '@/utils/auth/useSeal'

const btnStyleMap = (btnColor?: string) => {
  const colorMap = {
    gray: 'hover:text-gray-600 dark:hover:text-white focus:ring-gray-200 focus:text-gray-600 dark:focus:text-white border-gray-300 dark:border-gray-500 dark:focus:ring-gray-500',
    blue: 'hover:text-blue-600 focus:ring-blue-200 focus:text-blue-600 border-blue-300 dark:border-blue-700 dark:focus:ring-blue-500',
    teal: 'hover:text-teal-600 focus:ring-teal-200 focus:text-teal-600 border-teal-300 dark:border-teal-700 dark:focus:ring-teal-500',
    red: 'hover:text-red-600 focus:ring-red-200 focus:text-red-600 border-red-300 dark:border-red-700 dark:focus:ring-red-500',
    green:
      'hover:text-green-600 focus:ring-green-200 focus:text-green-600 border-green-300 dark:border-green-700 dark:focus:ring-green-500',
    pink: 'hover:text-pink-600 focus:ring-pink-200 focus:text-pink-600 border-pink-300 dark:border-pink-700 dark:focus:ring-pink-500',
    yellow:
      'hover:text-yellow-400 focus:ring-yellow-100 focus:text-yellow-400 border-yellow-300 dark:border-yellow-400 dark:focus:ring-yellow-300',
  }

  if (btnColor) {
    return colorMap[btnColor]
  }

  return colorMap.gray
}

export const DownloadButton = ({
  onClickCallback,
  btnColor,
  btnText,
  btnIcon,
  btnImage,
  btnTitle,
  disabled,
}: {
  onClickCallback: MouseEventHandler<HTMLButtonElement>
  btnColor?: string
  btnText: string
  btnIcon?: IconProp
  btnImage?: StaticImageData | string
  btnTitle?: string
  disabled?: boolean
}) => {
  return (
    <button
      className={`flex items-center space-x-2 rounded-lg border bg-white py-2 px-4 text-sm font-medium text-gray-900 hover:bg-gray-100/10 focus:z-10 focus:ring-2 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-900 ${btnStyleMap(
        btnColor
      )}`}
      title={btnTitle}
      onClick={onClickCallback}
      disabled={disabled}
    >
      {btnIcon && <FontAwesomeIcon icon={btnIcon} />}
      {btnImage && (
        <Image
          src={btnImage}
          alt={typeof btnImage === 'string' ? btnImage : ''}
          width={20}
          height={20}
          priority
          placeholder={typeof btnImage === 'string' ? undefined : 'blur'}
        />
      )}
      <span>{btnText}</span>
    </button>
  )
}

interface DownloadActionLabels {
  Download: string
  'Download the file directly through OneDrive': string
  'Copied direct link to clipboard': string
  'Copy the permalink to the file to the clipboard': string
  'Copy direct link': string
  'Customise link': string
}

export function DownloadActions({
  label,
  path,
  children,
}: PropsWithChildren<{
  label: DownloadActionLabels & CustomEmbedLinkMenuLabels
  path: string
}>) {
  const clipboard = useClipboard()
  const [menuOpen, setMenuOpen] = useState(false)

  const { payload, isLoading, error } = useSealedURL(path)

  return (
    <>
      <CustomEmbedLinkMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} label={label} path={path}>
        <Dialog.Title as="h3" className="py-2 text-xl font-bold">
          {label['Customise direct link']}
        </Dialog.Title>
        <Dialog.Description as="p" className="py-2 opacity-80">
          {label['Change the raw file direct link to a URL ending with the extension of the file.']}
          <a
            href="https://ovi.swo.moe/docs/features/customise-direct-link"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            {label['What is this?']}
          </a>
        </Dialog.Description>
      </CustomEmbedLinkMenu>
      <DownloadButton
        onClickCallback={() => window.open(toPermLink(path))}
        btnColor="blue"
        btnText={label['Download']}
        btnIcon={faFileDownload}
        btnTitle={label['Download the file directly through OneDrive']}
      />
      <DownloadButton
        onClickCallback={() => {
          const url = new URL(toPermLink(path, payload), window.location.origin)
          clipboard.copy(url.href)
          toast.success(label['Copied direct link to clipboard'])
        }}
        btnColor="pink"
        btnText={label['Copy direct link']}
        btnIcon={faCopy}
        btnTitle={label['Copy the permalink to the file to the clipboard']}
        disabled={isLoading || !!error}
      />
      <DownloadButton
        onClickCallback={() => setMenuOpen(true)}
        btnColor="teal"
        btnText={label['Customise link']}
        btnIcon={faPen}
      />
      {children}
    </>
  )
}

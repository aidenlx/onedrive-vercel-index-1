'use client'

import { MouseEventHandler, PropsWithChildren, ReactNode, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import Image from 'next/image'
import { useClipboard } from 'use-clipboard-copy'
import { toast } from 'react-hot-toast'
import type { CustomEmbedLinkMenuLabels } from './page/CustomEmbedLinkMenu'
import CustomEmbedLinkMenu from './page/CustomEmbedLinkMenu'
import { permLinkFromParams } from '@/utils/permlink'
import { Dialog } from '@headlessui/react'

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
}: {
  onClickCallback: MouseEventHandler<HTMLButtonElement>
  btnColor?: string
  btnText: string
  btnIcon?: IconProp
  btnImage?: string
  btnTitle?: string
}) => {
  return (
    <button
      className={`flex items-center space-x-2 rounded-lg border bg-white py-2 px-4 text-sm font-medium text-gray-900 hover:bg-gray-100/10 focus:z-10 focus:ring-2 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-900 ${btnStyleMap(
        btnColor
      )}`}
      title={btnTitle}
      onClick={onClickCallback}
    >
      {btnIcon && <FontAwesomeIcon icon={btnIcon} />}
      {btnImage && <Image src={btnImage} alt={btnImage} width={20} height={20} priority />}
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
  permLinkParams,
  children,
}: PropsWithChildren<{
  label: DownloadActionLabels & CustomEmbedLinkMenuLabels
  permLinkParams: Record<'encoded' | 'readable', string>
}>) {
  const clipboard = useClipboard()
  const [menuOpen, setMenuOpen] = useState(false)
  const getRawUrl = () => permLinkFromParams(permLinkParams.readable)

  return (
    <>
      <CustomEmbedLinkMenu menuOpen={menuOpen} setMenuOpen={setMenuOpen} label={label} permLinkParams={permLinkParams}>
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
        onClickCallback={() => window.open(getRawUrl())}
        btnColor="blue"
        btnText={label['Download']}
        btnIcon="file-download"
        btnTitle={label['Download the file directly through OneDrive']}
      />
      <DownloadButton
        onClickCallback={() => {
          clipboard.copy(getRawUrl())
          toast.success(label['Copied direct link to clipboard'])
        }}
        btnColor="pink"
        btnText={label['Copy direct link']}
        btnIcon="copy"
        btnTitle={label['Copy the permalink to the file to the clipboard']}
      />
      <DownloadButton
        onClickCallback={() => setMenuOpen(true)}
        btnColor="teal"
        btnText={label['Customise link']}
        btnIcon="pen"
      />
      {children}
    </>
  )
}

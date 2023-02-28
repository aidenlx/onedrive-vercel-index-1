'use client'

import { Dispatch, Fragment, PropsWithChildren, SetStateAction, useRef, useState } from 'react'

import { Dialog, Transition } from '@headlessui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useClipboard } from 'use-clipboard-copy'

import { toCustomisedPermLink, toPermLink } from '@/utils/permlink'
import type { CustomEmbedLinkMenuLabels } from './server'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { faCopy } from '@fortawesome/free-regular-svg-icons'
import { useSealedURL } from '@/utils/auth/useSeal'
import Loading from '@/components/LoadingClient'

function LinkContainer({
  title,
  value,
  loading,
  error,
}: {
  title: string
  value: string
  loading?: boolean
  error?: boolean
}) {
  return (
    <>
      <h4 className="py-2 text-xs font-medium uppercase tracking-wider">{title}</h4>
      <div className="group relative mb-2 max-h-24 overflow-y-scroll break-all rounded border border-gray-400/20 bg-gray-50 p-2.5 font-mono dark:bg-gray-800">
        <div className="opacity-80">{loading ? <Loading loadingText="loading..." /> : error ? 'error' : value}</div>
        <CopyButton value={value} />
      </div>
    </>
  )
}

function CopyButton({ value, disabled }: { value: string; disabled?: boolean }) {
  const clipboard = useClipboard({ copiedTimeout: 1000 })

  return (
    <button
      onClick={() => clipboard.copy(new URL(value, window.location.origin).href)}
      disabled={disabled}
      className="absolute top-[0.2rem] right-[0.2rem] w-8 rounded border border-gray-400/40 bg-gray-100 py-1.5 opacity-0 transition-all duration-100 hover:bg-gray-200 group-hover:opacity-100 dark:bg-gray-850 dark:hover:bg-gray-700"
    >
      {clipboard.copied ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faCopy} />}
    </button>
  )
}

export default function CustomEmbedLinkMenu({
  menuOpen,
  setMenuOpen,
  children,
  path,
  label,
}: PropsWithChildren<{
  menuOpen: boolean
  setMenuOpen: Dispatch<SetStateAction<boolean>>
  label: CustomEmbedLinkMenuLabels
  path: string
}>) {
  // Focus on input automatically when menu modal opens
  const focusInputRef = useRef<HTMLInputElement>(null)
  const closeMenu = () => setMenuOpen(false)

  const [name, setName] = useState(() => path.split('/').pop() ?? '')

  const { payload, error, isLoading } = useSealedURL(path)

  return (
    <Transition appear show={menuOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={closeMenu} initialFocus={focusInputRef}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-100"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-white/60 dark:bg-gray-800/60" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-100"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block max-h-[80vh] w-full max-w-3xl transform overflow-hidden overflow-y-scroll rounded border border-gray-400/30 bg-white p-4 text-left align-middle text-sm shadow-xl transition-all dark:bg-gray-900 dark:text-white">
              {children}
              <div className="mt-4">
                <h4 className="py-2 text-xs font-medium uppercase tracking-wider">{label.Filename}</h4>
                <input
                  className="mb-2 w-full rounded border border-gray-600/10 p-2.5 font-mono focus:outline-none focus:ring focus:ring-blue-300 dark:bg-gray-600 dark:text-white dark:focus:ring-blue-700"
                  ref={focusInputRef}
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                <LinkContainer
                  title={label.Default}
                  value={toPermLink(path, payload)}
                  error={error}
                  loading={isLoading}
                />
                <LinkContainer
                  title={label['URL encoded']}
                  value={toPermLink(path, payload, false)}
                  error={error}
                  loading={isLoading}
                />
                <LinkContainer
                  title={label.Customised}
                  value={toCustomisedPermLink(name, path, payload)}
                  error={error}
                  loading={isLoading}
                />
                <LinkContainer
                  title={label['Customised and encoded']}
                  value={toCustomisedPermLink(name, path, payload, false)}
                  error={error}
                  loading={isLoading}
                />
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

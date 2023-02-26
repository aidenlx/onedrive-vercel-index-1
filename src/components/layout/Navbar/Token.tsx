'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Dialog, Transition } from '@headlessui/react'
import toast from 'react-hot-toast'

import { useRouter } from 'next/navigation'
import { Fragment, useState, useTransition } from 'react'

import { protectedRoutes } from '@cfg/site.config'
import { useClearAllToken } from '@/utils/useStoredToken'
import { faKey, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons'

type TokenLabels = Record<keyof IntlMessages['layout']['token'], string>

export function TokenPresent({ label }: { label: TokenLabels }) {
  const [open, setOpen] = useState(false)
  const t = (key: keyof TokenLabels) => label[key]
  return (
    <>
      <button className="flex items-center space-x-2 hover:opacity-80 dark:text-white" onClick={() => setOpen(true)}>
        <span className="hidden text-sm font-medium md:inline-block">{t('Logout')}</span>
        <FontAwesomeIcon icon={faSignOutAlt} />
      </button>
      <ClearTokenModal open={open} onClose={() => setOpen(false)} label={label} />
    </>
  )
}

export function ClearTokenModal({ open, onClose, label }: { onClose: () => void; open: boolean; label: TokenLabels }) {
  const router = useRouter()
  const t = (key: keyof TokenLabels) => label[key]

  const removeAll = useClearAllToken()
  const [_, startTransition] = useTransition()

  const clearTokens = () => {
    onClose()
    removeAll()
    toast.success(t('Cleared all tokens'))
    startTransition(() => {
      router.refresh()
    })
  }
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" open={open} onClose={onClose}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-100"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-50"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-50 dark:bg-gray-800" />
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
            leave="ease-in duration-50"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="my-8 inline-block w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle transition-all dark:bg-gray-900">
              <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {t('Clear all tokens?')}
              </Dialog.Title>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  {t('These tokens are used to authenticate yourself into password protected folders, ') +
                    t('clearing them means that you will need to re-enter the passwords again')}
                </p>
              </div>

              <div className="mt-4 max-h-32 overflow-y-scroll font-mono text-sm dark:text-gray-100">
                {protectedRoutes.map((r, i) => (
                  <div key={i} className="flex items-center space-x-1">
                    <FontAwesomeIcon icon={faKey} />
                    <span className="truncate">{r}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center justify-end">
                <button
                  className="mr-3 inline-flex items-center justify-center space-x-2 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-400 focus:outline-none focus:ring focus:ring-blue-300"
                  onClick={onClose}
                >
                  {t('Cancel')}
                </button>
                <button
                  className="inline-flex items-center justify-center space-x-2 rounded bg-red-500 px-4 py-2 text-white hover:bg-red-400 focus:outline-none focus:ring focus:ring-red-300"
                  onClick={() => clearTokens()}
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                  <span>{t('Clear all')}</span>
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}

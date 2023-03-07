'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Image from 'next/image'
import AuthImage from '@img/fabulous-wapmire-weekdays.png'

import { useState, useTransition } from 'react'
import { useRouter } from 'next-intl/client'
import { faArrowRight } from '@fortawesome/free-solid-svg-icons'
import { useUnlockedPaths } from '@od/util/protect-client'
import { toast } from 'react-hot-toast'

interface AuthLabels {
  'This route (the folder itself and the files inside) is password protected': string
  'If you know the password, please enter it below': string
  'Enter Password': string
}

export function Auth({ redirect, label }: { label: AuthLabels; redirect: string }) {
  const router = useRouter()
  const { mutate } = useUnlockedPaths()

  const protectedRoute = matchProtectedRoute(redirect)
  const [isPending, startTransition] = useTransition()

  const [token, setToken] = useState('')

  const setPersistedToken = async (token: string) => {
    if (!protectedRoute) {
      toast('Route is not protected, redirecting back...', { icon: '🤔' })
      return
    }
    await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ [protectedRoute]: token }) })
    await mutate()
  }

  async function applyToken() {
    await setPersistedToken(token)
    startTransition(() => {
      router.push(redirect)
    })
  }

  if (isPending) {
    return <Loading loadingText="Applying..." />
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col space-y-4 md:my-10">
      <div className="mx-auto w-3/4 md:w-5/6">
        <Image src={AuthImage} alt="authenticate" width={912} height={912} priority />
      </div>
      <div className="text-lg font-bold text-gray-900 dark:text-gray-100">{label['Enter Password']}</div>

      <p className="text-sm font-medium text-gray-500">
        {label['This route (the folder itself and the files inside) is password protected'] +
          label['If you know the password, please enter it below']}
      </p>

      <div className="flex items-center space-x-2">
        <input
          className="flex-1 rounded border border-gray-600/10 p-2 font-mono focus:outline-none focus:ring focus:ring-blue-300 dark:bg-gray-600 dark:text-white dark:focus:ring-blue-700"
          autoFocus
          type="password"
          placeholder="************"
          value={token}
          onChange={e => setToken(e.target.value)}
          onKeyUp={e => {
            if (e.key === 'Enter' || e.key === 'NumpadEnter') {
              applyToken()
            }
          }}
        />
        <button
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 focus:outline-none focus:ring focus:ring-blue-400"
          onClick={applyToken}
        >
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    </div>
  )
}
import { Dialog, Transition } from '@headlessui/react'

import { Fragment } from 'react'

import { protectedRoutes } from '@od/cfg/api'
import { faKey, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons'
import Loading from './Loading'
import { matchProtectedRoute } from '@od/util/protect'

type TokenLabels = Record<keyof IntlMessages['layout']['token'], string>

export function TokenPresent({ label }: { label: TokenLabels }) {
  const [open, setOpen] = useState(false)

  const { data } = useUnlockedPaths()

  const tokenPresent = data && data.authenticated.length > 0
  if (!tokenPresent) return null
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

function ClearTokenModal({ open, onClose, label }: { onClose: () => void; open: boolean; label: TokenLabels }) {
  const router = useRouter()

  const [_, startTransition] = useTransition()

  const { mutate } = useUnlockedPaths()

  const removeAll = async () => {
    await fetch('/api/auth', { method: 'DELETE' })
    await mutate()
  }
  const clearTokens = async () => {
    onClose()
    await removeAll()
    toast.success(t('Cleared all tokens'))
    startTransition(() => {
      router.refresh()
    })
  }

  const t = (key: keyof TokenLabels) => label[key]
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

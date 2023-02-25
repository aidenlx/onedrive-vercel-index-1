'use client'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Image from 'next/image'

import { useSetPersistedToken } from '@/utils/useStoredToken'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface AuthLabels {
  'This route (the folder itself and the files inside) is password protected': string
  'If you know the password, please enter it below': string
  'Enter Password': string
}

export default function Auth({ redirect, label }: { redirect: string; label: AuthLabels }) {
  const router = useRouter()
  const setPersistedToken = useSetPersistedToken(redirect)

  const [_, startTransition] = useTransition()

  const [token, setToken] = useState('')

  function applyToken() {
    startTransition(() => {
      setPersistedToken(token)
      router.refresh()
    })
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col space-y-4 md:my-10">
      <div className="mx-auto w-3/4 md:w-5/6">
        <Image src={'/images/fabulous-wapmire-weekdays.png'} alt="authenticate" width={912} height={912} priority />
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
          <FontAwesomeIcon icon="arrow-right" />
        </button>
      </div>
    </div>
  )
}

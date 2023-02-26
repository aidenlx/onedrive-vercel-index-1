'use client'

import { Fragment } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Listbox, Transition } from '@headlessui/react'

import { useLocalStorageValue } from '@react-hookz/web'
import { faCheck, faChevronDown, faTh, faThList } from '@fortawesome/free-solid-svg-icons'

export const layouts: Array<{ id: number; name: 'Grid' | 'List'; icon: keyof typeof layoutIcons }> = [
  { id: 1, name: 'List', icon: 'th-list' },
  { id: 2, name: 'Grid', icon: 'th' },
]

const layoutIcons = {
  'th-list': faThList,
  th: faTh,
} as const

type LayoutMessage = Record<keyof IntlMessages['layout']['layouts'], string>

const SwitchLayout = ({ msg }: { msg: LayoutMessage }) => {
  const layout = useLocalStorageValue('preferredLayout', {
    defaultValue: layouts[0],
    initializeWithValue: false,
  })
  const preferredLayout = layout.value ?? layouts[0]

  const tLayout = (key: string) => msg[key] ?? key

  return (
    <div className="relative w-24 flex-shrink-0 text-sm text-gray-600 dark:text-gray-300 md:w-28">
      <Listbox value={preferredLayout} onChange={val => layout.set(val)}>
        <Listbox.Button className="relative w-full cursor-pointer rounded pl-4">
          <span className="pointer-events-none flex items-center">
            <FontAwesomeIcon className="mr-2 h-3 w-3" icon={layoutIcons[preferredLayout.icon]} />
            <span>
              {
                // t('Grid')
                // t('List')
                tLayout(preferredLayout.name)
              }
            </span>
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <FontAwesomeIcon className="h-3 w-3" icon={faChevronDown} />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          enter="transition duration-100 ease-out"
          enterFrom="transform scale-95 opacity-0"
          enterTo="transform scale-100 opacity-100"
          leave="transition duration-75 ease-out"
          leaveFrom="transform scale-100 opacity-100"
          leaveTo="transform scale-95 opacity-0"
        >
          <Listbox.Options className="absolute right-0 z-20 mt-1 w-32 overflow-auto rounded border border-gray-900/10 bg-white py-1 shadow-lg focus:outline-none dark:border-gray-500/30 dark:bg-gray-800">
            {layouts.map(layout => (
              <Listbox.Option
                key={layout.id}
                className={`${
                  layout.name === preferredLayout.name &&
                  'bg-blue-50 text-blue-700 dark:bg-blue-600/10 dark:text-blue-400'
                } relative flex cursor-pointer select-none items-center py-1.5 pl-3 text-gray-600 hover:opacity-80 dark:text-gray-300`}
                value={layout}
              >
                <FontAwesomeIcon className="mr-2 h-3 w-3" icon={layoutIcons[layout.icon]} />
                <span className={layout.name === preferredLayout.name ? 'font-medium' : 'font-normal'}>
                  {
                    // t('Grid')
                    // t('List')
                    tLayout(layout.name)
                  }
                </span>
                {layout.name === preferredLayout.name && (
                  <span className="absolute inset-y-0 right-3 flex items-center">
                    <FontAwesomeIcon className="h-3 w-3" icon={faCheck} />
                  </span>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </div>
  )
}

export default SwitchLayout

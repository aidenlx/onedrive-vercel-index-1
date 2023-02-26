import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { Link } from 'next-intl'
import Image from 'next/image'
import { PropsWithChildren, ReactNode } from 'react'

import { links, icon, title, email } from '@cfg/site.config'
import { faWeibo, IconDefinition } from '@fortawesome/free-brands-svg-icons'
import { faEnvelope } from '@fortawesome/free-regular-svg-icons'

type LinkMessage = Record<keyof IntlMessages['layout']['links'], string>

const LinkIcons = {
  Weibo: faWeibo,
}

export default function Navbar({
  children,
  right,
  msgLink,
  label,
}: PropsWithChildren<{ right?: ReactNode; msgLink: LinkMessage; label: { email: string } }>) {
  const tLink = (key: string) => msgLink[key] ?? key
  return (
    <div className="sticky top-0 z-[100] border-b border-gray-900/10 bg-white bg-opacity-80 backdrop-blur-md dark:border-gray-500/30 dark:bg-gray-900">
      <div className="mx-auto flex w-full items-center justify-between space-x-4 px-4 py-1">
        <Link href="/" passHref className="flex items-center space-x-2 py-2 hover:opacity-80 dark:text-white md:p-2">
          <Image src={icon} alt="icon" width="25" height="25" priority />
          <span className="hidden font-bold sm:block">{title}</span>
        </Link>

        <div className="flex flex-1 items-center space-x-4 text-gray-700 md:flex-initial">
          {children}
          {links?.map((l: { name: string; link: string; icon?: IconDefinition }) => (
            <a
              key={l.name}
              href={l.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 hover:opacity-80 dark:text-white"
            >
              {l.icon && <FontAwesomeIcon icon={l.icon} />}
              <span className="hidden text-sm font-medium md:inline-block">
                {
                  // Append link name comments here to add translations
                  // t('Weibo')
                  tLink(l.name)
                }
              </span>
            </a>
          ))}

          {email && (
            <a href={email} className="flex items-center space-x-2 hover:opacity-80 dark:text-white">
              <FontAwesomeIcon icon={faEnvelope} />
              <span className="hidden text-sm font-medium md:inline-block">{label.email}</span>
            </a>
          )}

          {right}
        </div>
      </div>
    </div>
  )
}

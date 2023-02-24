import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconName } from '@fortawesome/fontawesome-svg-core'

import { Link } from 'next-intl'
import Image from 'next/image'
import { PropsWithChildren, ReactNode } from 'react'

import siteConfig from '@cfg/site.config'

type LinkMessage = Record<keyof IntlMessages['layout']['links'], string>

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
          <Image src={siteConfig.icon} alt="icon" width="25" height="25" priority />
          <span className="hidden font-bold sm:block">{siteConfig.title}</span>
        </Link>

        <div className="flex flex-1 items-center space-x-4 text-gray-700 md:flex-initial">
          {children}
          {siteConfig.links.length !== 0 &&
            siteConfig.links.map((l: { name: string; link: string }) => (
              <a
                key={l.name}
                href={l.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:opacity-80 dark:text-white"
              >
                <FontAwesomeIcon icon={['fab', l.name.toLowerCase() as IconName]} />
                <span className="hidden text-sm font-medium md:inline-block">
                  {
                    // Append link name comments here to add translations
                    // t('Weibo')
                    tLink(l.name)
                  }
                </span>
              </a>
            ))}

          {siteConfig.email && (
            <a href={siteConfig.email} className="flex items-center space-x-2 hover:opacity-80 dark:text-white">
              <FontAwesomeIcon icon={['far', 'envelope']} />
              <span className="hidden text-sm font-medium md:inline-block">{label.email}</span>
            </a>
          )}

          {right}
        </div>
      </div>
    </div>
  )
}

import { Link } from 'next-intl'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslations } from 'next-intl'
import { faFlag } from '@fortawesome/free-regular-svg-icons'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons'

const HomeCrumb = () => {
  const t = useTranslations('layout.basic')

  return (
    <Link href="/" className="flex items-center">
      <FontAwesomeIcon className="h-3 w-3" icon={faFlag} />
      <span className="ml-2 font-medium">{t('Home')}</span>
    </Link>
  )
}

const Breadcrumb = ({ paths }: { paths: string[] }) => {
  if (!paths.length)
    return (
      <div className="text-sm text-gray-600 transition-all duration-75 hover:opacity-80 dark:text-gray-300">
        <HomeCrumb />
      </div>
    )
  // We are rendering the path in reverse, so that the browser automatically scrolls to the end of the breadcrumb
  // https://stackoverflow.com/questions/18614301/keep-overflow-div-scrolled-to-bottom-unless-user-scrolls-up/18614561
  return (
    <ol className="no-scrollbar inline-flex flex-row-reverse items-center gap-1 overflow-x-scroll text-sm text-gray-600 dark:text-gray-300 md:gap-3">
      {paths
        .slice(0)
        .reverse()
        .map((p: string, i: number) => (
          <li key={i} className="flex flex-shrink-0 items-center">
            <FontAwesomeIcon className="h-3 w-3" icon={faAngleRight} />
            <Link
              href={`/${paths
                .slice(0, paths.length - i)
                .join('/')}`}
              passHref
              className={`ml-1 transition-all duration-75 hover:opacity-70 md:ml-3 ${
                i == 0 && 'pointer-events-none opacity-80'
              }`}
            >
              {decodeURIComponent(p)}
            </Link>
          </li>
        ))}
      <li className="flex-shrink-0 transition-all duration-75 hover:opacity-80">
        <HomeCrumb />
      </li>
    </ol>
  )
}

export default Breadcrumb

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ReactNode } from 'react'

function FourOhFour({ children }: { children: ReactNode }) {
  const t = useTranslations('fof')
  return (
    <div className="my-12">
      <div className="mx-auto w-1/3">
        <Image src="/images/fabulous-rip-2.png" alt="404" width={912} height={912} priority />
      </div>
      <div className="mx-auto mt-6 max-w-xl text-gray-500">
        <div className="mb-8 text-xl font-bold">
          {t.rich("Oops, that's a <1>four-oh-four</1>", {
            fof: chunks => <span className="underline decoration-red-500 decoration-wavy">{chunks}</span>,
          })}
        </div>
        <div className="mb-4 overflow-hidden break-all rounded border border-gray-400/20 bg-gray-50 p-2 font-mono text-xs dark:bg-gray-800">
          {children}
        </div>
        <div className="text-sm">
          {t.rich(
            'Press <2>F12</2> and open devtools for more details, or seek help at <6>onedrive-vercel-index discussions</6>',
            {
              kbd: chunks => (
                <kbd className="rounded border border-gray-400/20 bg-gray-100 px-1 font-mono text-xs dark:bg-gray-800">
                  {chunks}
                </kbd>
              ),
              link: chunks => (
                <a
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                  href="https://github.com/spencerwooo/onedrive-vercel-index/discussions"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {chunks}
                </a>
              ),
            }
          )}
        </div>
      </div>
    </div>
  )
}

export default FourOhFour

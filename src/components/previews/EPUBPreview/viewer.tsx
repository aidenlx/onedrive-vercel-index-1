'use client'

import Loading from '@/components/LoadingClient'
import { useState, useRef, useEffect } from 'react'
import { ReactReader } from 'react-reader'

export interface Props {
  src: string;
  label: {
    loadingEPUB: string;
  };
}

export default function EPUBViewer({ src, label }: Props) {
  const [epubContainerWidth, setEpubContainerWidth] = useState(400)
  const epubContainer = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setEpubContainerWidth(epubContainer.current ? epubContainer.current.offsetWidth : 400)
  }, [])

  const [location, setLocation] = useState<string>()
  const onLocationChange = (cfiStr: string) => setLocation(cfiStr)

  // Fix for not valid epub files according to
  // https://github.com/gerhardsletten/react-reader/issues/33#issuecomment-673964947
  const fixEpub = rendition => {
    const spineGet = rendition.book.spine.get.bind(rendition.book.spine)
    rendition.book.spine.get = function (target: string) {
      const targetStr = target as string
      let t = spineGet(target)
      while (t == null && targetStr.startsWith('../')) {
        target = targetStr.substring(3)
        t = spineGet(target)
      }
      return t
    }
  }
  return (
    <div className="no-scrollbar w-full flex-1 overflow-scroll" ref={epubContainer} style={{ minHeight: '70vh' }}>
      <div
        style={{
          position: 'absolute',
          width: epubContainerWidth,
          height: '70vh',
        }}
      >
        <ReactReader
          url={src}
          getRendition={rendition => fixEpub(rendition)}
          loadingView={<Loading loadingText={label.loadingEPUB} />}
          location={location}
          locationChanged={onLocationChange}
          epubInitOptions={{ openAs: 'epub' }}
          epubOptions={{ flow: 'scrolled', allowPopups: true }}
        />
      </div>
    </div>
  )
}
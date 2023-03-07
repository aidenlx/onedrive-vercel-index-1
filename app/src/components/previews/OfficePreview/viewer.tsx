'use client'

import { useState, useRef, useEffect } from 'react'

export interface Props {
  src: string
}

export default function OfficeViewer({ src }: Props) {
  const docContainer = useRef<HTMLDivElement>(null)
  const [docContainerWidth, setDocContainerWidth] = useState(600)

  useEffect(() => {
    setDocContainerWidth(docContainer.current ? docContainer.current.offsetWidth : 600)
  }, [])
  return (
    <div className="overflow-scroll" ref={docContainer} style={{ maxHeight: '90vh' }}>
      <Preview url={src} width={docContainerWidth.toString()} height="600" />
    </div>
  )
}


// https://github.com/yatheeshraju/preview-office-docs/blob/master/src/index.js
function Preview({ url, height, width }: { url: string; height?: string; width?: string }) {
  return (
    <div>
      {url && (
        <iframe
          src={`https://view.officeapps.live.com/op/embed.aspx?src=${url}`}
          width={'800px' && width}
          height={'400px' && height}
          frameBorder="0"
        >
          This is an embedded
          <a target="_blank" href="http://office.com">
            Microsoft Office
          </a>
          document, powered by
          <a target="_blank" href="http://office.com/webapps">
            Office Online
          </a>
        </iframe>
      )}
    </div>
  )
}

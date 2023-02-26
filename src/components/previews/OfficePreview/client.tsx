'use client'

import Preview from 'preview-office-docs'
import { useState, useRef, useEffect } from 'react'

export function OfficeViewer({ src }: { src: string }) {
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

'use client'

import FourOhFour from '@ui/FourOhFour'
import { PreviewContainer } from '@ui/layout/Containers'
import { useEffect } from 'react'

export default function Error({ error }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <PreviewContainer>
      <FourOhFour>{error.message}</FourOhFour>
    </PreviewContainer>
  )
}

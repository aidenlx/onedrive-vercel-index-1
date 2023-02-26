'use client'

import useSystemTheme from 'react-use-system-theme'
import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrowNightEighties, tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { getLanguageByFileName } from '@/utils/getPreviewType'

export interface Props {
  content: string
  fileName: string
}

export default function CodeViewer({ content, fileName }: Props) {
  const theme = useSystemTheme('dark')
  return (
    <SyntaxHighlighter
      language={getLanguageByFileName(fileName)}
      style={theme === 'dark' ? tomorrowNightEighties : tomorrow}
    >
      {content}
    </SyntaxHighlighter>
  )
}

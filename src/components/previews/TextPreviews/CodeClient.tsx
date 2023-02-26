'use client'

import useSystemTheme from 'react-use-system-theme'
import { LightAsync as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrowNightEighties, tomorrow } from 'react-syntax-highlighter/dist/cjs/styles/hljs'
import { getLanguageByFileName } from '@/utils/getPreviewType'

export default function CodePreview({ content, fileName }: { content: string; fileName: string }) {
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

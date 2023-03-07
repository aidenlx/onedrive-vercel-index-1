'use client'

import { layouts } from '@ui/layout/SwitchLayout'
import { useLocalStorageValue } from '@react-hookz/web'
import { ReactNode } from 'react'

export default function FolderLayout({ grid, list }: { grid: ReactNode; list: ReactNode }) {
  const layout = useLocalStorageValue('preferredLayout', { defaultValue: layouts[0], initializeWithValue: false })

  if (layout.value?.name === 'Grid') {
    return <>{grid}</>
  }
  return <>{list}</>
}

'use client'

import { create } from 'zustand'

interface BearState {
  selected: Map<string, boolean>
  updateItems(items: string[]): void
  toggleSelected(id: string): void
  clearSelected(): void
  selectAll(): void
  toggleSelectAll(): void
  folderGenerating: Set<string>
  startFolderGenerating(id: string): void
  folderGenerated(id: string): void
}

enum SelectedState {
  none,
  some,
  all,
}

export const totalSelectState = (state: BearState) => {
  let someSelected = false,
    someNotSelected = false
  for (const [, selected] of state.selected) {
    if (selected) {
      someSelected = true
    } else {
      someNotSelected = true
    }
    if (someSelected && someNotSelected) {
      return SelectedState.some
    }
  }
  return someSelected ? SelectedState.all : SelectedState.none
}

export const useStore = create<BearState>(set => ({
  selected: new Map(),
  updateItems(items: string[]) {
    set(state => {
      const newSelected = new Map()
      for (const id of items) {
        newSelected.set(id, state.selected.get(id) ?? false)
      }
      return { selected: newSelected }
    })
  },
  toggleSelected: (id: string) =>
    set(state => {
      const newSelected = new Map(state.selected)
      if (!newSelected.has(id)) {
        throw new Error('id not found in selected')
      }
      newSelected.set(id, !newSelected.get(id))
      return { selected: newSelected }
    }),
  clearSelected() {
    set(state => {
      const newSelected = new Map()
      for (const [id] of state.selected) {
        newSelected.set(id, false)
      }
      return { selected: newSelected }
    })
  },
  selectAll() {
    set(state => {
      const newSelected = new Map()
      for (const [id] of state.selected) {
        newSelected.set(id, true)
      }
      return { selected: newSelected }
    })
  },
  toggleSelectAll() {
    set(state => {
      const allSelect = totalSelectState(state)
      const newSelected = new Map()
      for (const [id] of state.selected) {
        newSelected.set(id, allSelect === SelectedState.all ? false : true)
      }
      return { selected: newSelected }
    })
  },
  folderGenerating: new Set(),
  startFolderGenerating(id: string) {
    set(state => {
      const newFolderGenerating = new Set(state.folderGenerating)
      newFolderGenerating.add(id)
      return { folderGenerating: newFolderGenerating }
    })
  },
  folderGenerated(id: string) {
    set(state => {
      const newFolderGenerating = new Set(state.folderGenerating)
      newFolderGenerating.delete(id)
      return { folderGenerating: newFolderGenerating }
    })
  },
}))

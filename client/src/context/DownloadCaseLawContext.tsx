import {
  type ReactNode,
  createContext,
  useContext,
  useState,
} from 'react'
import type { SelectedCaselawItem } from '@/types'
import { downloadSelectedCaselawAsZip } from '@/utils'

type DownloadCaselawContextType = {
  selectedCaselaw: SelectedCaselawItem[]
  setCaselawSelection: (item: SelectedCaselawItem, selected: boolean) => void
  isSelected: (id: string) => boolean
  startDownloadPdf: () => void
  clearSelection: () => void
  handleDownloadMode: () => void
  isDownloadMode: boolean
}

const DownloadCaselawContext
  = createContext<DownloadCaselawContextType | null>(null)

export function DownloadCaselawProvider({
  children,
}: {
  children: ReactNode
}) {
  const [selectedCaselaw, setSelectedCaselaw] = useState<
    SelectedCaselawItem[]
  >([])
  const [isDownloadMode, setIsDownloadMode] = useState(false)
  const setCaselawSelection = (
    item: SelectedCaselawItem,
    selected: boolean,
  ) => {
    setSelectedCaselaw((prev) => {
      if (selected) {
        const alreadySelected = prev.some(
          currentItem => currentItem.id === item.id,
        )

        return alreadySelected ? prev : [...prev, item]
      }

      return prev.filter(
        currentItem => currentItem.id !== item.id,
      )
    })
  }

  const isSelected = (id: string) => {
    return selectedCaselaw.some(item => item.id === id)
  }

  const clearSelection = () => {
    setSelectedCaselaw([])
  }

  const startDownloadPdf = () => {
    downloadSelectedCaselawAsZip(selectedCaselaw)
    clearSelection()
  }
  const handleDownloadMode = () => {
    setIsDownloadMode(!isDownloadMode)
  }
  return (
    <DownloadCaselawContext.Provider
      value={{
        selectedCaselaw,
        startDownloadPdf,
        setCaselawSelection,
        isSelected,
        isDownloadMode,
        clearSelection,
        handleDownloadMode,
      }}
    >
      {children}
    </DownloadCaselawContext.Provider>
  )
}

export function useDownloadCaselaw() {
  const context = useContext(DownloadCaselawContext)

  if (!context) {
    throw new Error(
      'useDownloadCaselaw must be used within DownloadCaselawProvider',
    )
  }

  return context
}

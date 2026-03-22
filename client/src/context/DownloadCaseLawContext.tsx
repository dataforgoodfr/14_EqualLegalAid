import {
  type ReactNode,
  createContext,
  useContext,
  useState,
} from 'react'
import type { PdfObjectInterface } from '@/types'
import { downloadSelectedCaselawAsZip } from '@/utils'
export interface SelectedCaselawItem {
  id: string
  pdf: PdfObjectInterface
}

type DownloadCaselawContextType = {
  selectedCaselaw: SelectedCaselawItem[]
  setCaselawSelection: (item: SelectedCaselawItem, selected: boolean) => void
  isSelected: (id: string) => boolean
  startDownloadPdf: () => void
  clearSelection: () => void
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
    console.log('startDownloadPdf', selectedCaselaw)
  }
  return (
    <DownloadCaselawContext.Provider
      value={{
        selectedCaselaw,
        startDownloadPdf,
        setCaselawSelection,
        isSelected,
        clearSelection,
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

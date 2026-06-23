import { useMemo } from 'react'
import { toCaselaw } from './formatters'

export const useSortPerDate = (records: any[], sortDesc: boolean) => {
  return useMemo(() => {
    const converted = records.map(toCaselaw)
    return converted.sort((a, b) => {
      const timeA = a.publishedAt.getTime()
      const timeB = b.publishedAt.getTime()
      if (Number.isNaN(timeA) && Number.isNaN(timeB)) return 0
      if (Number.isNaN(timeA)) return 1
      if (Number.isNaN(timeB)) return -1
      return sortDesc ? timeB - timeA : timeA - timeB
    })
  }, [records, sortDesc])
}

/** @deprecated Use useSortPerDate instead */
export const sortPerDate = useSortPerDate

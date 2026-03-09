import { useCallback, useEffect, useMemo, useState } from 'react'
import { createAirtableService } from '../services/airtableService'
import { AIRTABLE_CONFIG, APP_CONFIG } from '../constants/config'
import type { AirtablePaginationState, AirtableRecord, AirtableSortDirection } from '../types'

const INITIAL_OFFSETS: Record<number, string | undefined> = {
  1: undefined,
}

/**
 * Custom hook for fetching and managing Airtable records
 */
export const useAirtable = () => {
  const [records, setRecords] = useState<AirtableRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSizeState] = useState<number>(APP_CONFIG.pagination.defaultPageSize)
  const [sortDirection, setSortDirection]
    = useState<AirtableSortDirection>(APP_CONFIG.defaultSortDirection)
  const [offsetsByPage, setOffsetsByPage]
    = useState<Record<number, string | undefined>>(INITIAL_OFFSETS)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [isLastPageKnown, setIsLastPageKnown] = useState(false)

  const sort = useMemo(
    () => [
      {
        field: APP_CONFIG.defaultSortField,
        direction: sortDirection,
      },
    ],
    [sortDirection],
  )

  const fetchPage = useCallback(
    async(page: number, offset?: string, resetPagination: boolean = false) => {
      try {
        setLoading(true)
        setError(null)

        const airtableService = createAirtableService(AIRTABLE_CONFIG)
        const { records: fetchedRecords, nextOffset } = await airtableService.fetchPage({
          viewName: APP_CONFIG.defaultView,
          pageSize,
          offset,
          sort,
        })

        setRecords(fetchedRecords)
        setCurrentPage(page)
        setHasNextPage(Boolean(nextOffset))
        setIsLastPageKnown(!nextOffset)
        setOffsetsByPage((previousOffsets) => {
          const sourceOffsets = resetPagination ? INITIAL_OFFSETS : previousOffsets
          const nextOffsets = Object.entries(sourceOffsets)
            .filter(([pageNumber]) => Number(pageNumber) <= page)
            .reduce<Record<number, string | undefined>>((accumulator, [pageNumber, pageOffset]) => {
              accumulator[Number(pageNumber)] = pageOffset
              return accumulator
            }, { 1: undefined })

          if (page > 1) {
            nextOffsets[page] = offset
          }

          if (nextOffset) {
            nextOffsets[page + 1] = nextOffset
          }

          return nextOffsets
        })
      }
      catch(err: unknown) {
        const errorMessage
          = err instanceof Error ? err.message : 'Failed to fetch records from Airtable'
        setError(errorMessage)
        console.error('Airtable error:', err)
      }
      finally {
        setLoading(false)
      }
    },
    [pageSize, sort],
  )

  useEffect(() => {
    void fetchPage(1, undefined, true)
  }, [fetchPage])

  const goToPage = useCallback(
    async(page: number) => {
      if (page < 1 || page === currentPage) {
        return
      }

      const offset = page === 1 ? undefined : offsetsByPage[page]
      if (page > 1 && !offset) {
        return
      }

      await fetchPage(page, offset)
    },
    [currentPage, fetchPage, offsetsByPage],
  )

  const goToNextPage = useCallback(async() => {
    const nextPage = currentPage + 1
    const nextOffset = offsetsByPage[nextPage]

    if (!nextOffset) {
      return
    }

    await fetchPage(nextPage, nextOffset)
  }, [currentPage, fetchPage, offsetsByPage])

  const goToPreviousPage = useCallback(async() => {
    if (currentPage === 1) {
      return
    }

    const previousPage = currentPage - 1
    const previousOffset = previousPage === 1 ? undefined : offsetsByPage[previousPage]
    await fetchPage(previousPage, previousOffset)
  }, [currentPage, fetchPage, offsetsByPage])

  const setPageSize = useCallback(
    (nextPageSize: number) => {
      if (nextPageSize === pageSize) {
        return
      }

      setPageSizeState(nextPageSize)
      setOffsetsByPage(INITIAL_OFFSETS)
      setCurrentPage(1)
    },
    [pageSize],
  )

  const updateSortDirection = useCallback(
    (nextSortDirection: AirtableSortDirection) => {
      if (nextSortDirection === sortDirection) {
        return
      }

      setSortDirection(nextSortDirection)
      setOffsetsByPage(INITIAL_OFFSETS)
      setCurrentPage(1)
    },
    [sortDirection],
  )

  const refetchCurrentPage = useCallback(async() => {
    const currentOffset = currentPage === 1 ? undefined : offsetsByPage[currentPage]
    await fetchPage(currentPage, currentOffset, currentPage === 1)
  }, [currentPage, fetchPage, offsetsByPage])

  const pagination = useMemo<AirtablePaginationState>(() => {
    const knownPageCount = Math.max(...Object.keys(offsetsByPage).map(Number))

    return {
      currentPage,
      pageSize,
      knownPageCount,
      hasNextPage,
      isLastPageKnown,
      pageSizeOptions: APP_CONFIG.pagination.pageSizeOptions,
    }
  }, [currentPage, hasNextPage, isLastPageKnown, offsetsByPage, pageSize])

  return {
    records,
    loading,
    error,
    pagination,
    sortDirection,
    setSortDirection: updateSortDirection,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    setPageSize,
    refetch: refetchCurrentPage,
  }
}

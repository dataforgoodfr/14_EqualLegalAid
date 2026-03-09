import { useCallback, useEffect, useMemo, useReducer } from 'react'
import { createAirtableService } from '../services/airtableService'
import { AIRTABLE_CONFIG, APP_CONFIG } from '../constants/config'
import type { AirtablePaginationState, AirtableRecord, AirtableSortDirection } from '../types'

const INITIAL_OFFSETS: Record<number, string | undefined> = {
  1: undefined,
}

interface State {
  records: AirtableRecord[]
  loading: boolean
  error: string | null
  currentPage: number
  pageSize: number
  sortDirection: AirtableSortDirection
  offsetsByPage: Record<number, string | undefined>
  hasNextPage: boolean
  isLastPageKnown: boolean
}

type Action
  = | { type: 'FETCH_START' }
    | { type: 'FETCH_SUCCESS', page: number, records: AirtableRecord[], nextOffset?: string, offset?: string, reset: boolean }
    | { type: 'FETCH_ERROR', error: string }
    | { type: 'SET_PAGE_SIZE', pageSize: number }
    | { type: 'SET_SORT_DIRECTION', direction: AirtableSortDirection }

const initialState: State = {
  records: [],
  loading: true,
  error: null,
  currentPage: 1,
  pageSize: APP_CONFIG.pagination.defaultPageSize,
  sortDirection: APP_CONFIG.defaultSortDirection,
  offsetsByPage: INITIAL_OFFSETS,
  hasNextPage: false,
  isLastPageKnown: false,
}

const buildOffsets = (
  source: Record<number, string | undefined>,
  page: number,
  offset?: string,
  nextOffset?: string,
): Record<number, string | undefined> => {
  const result: Record<number, string | undefined> = { 1: undefined }
  for (const [key, value] of Object.entries(source)) {
    if (Number(key) <= page) result[Number(key)] = value
  }
  if (page > 1) result[page] = offset
  if (nextOffset) result[page + 1] = nextOffset
  return result
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null }
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        records: action.records,
        currentPage: action.page,
        hasNextPage: Boolean(action.nextOffset),
        isLastPageKnown: !action.nextOffset,
        offsetsByPage: buildOffsets(
          action.reset ? INITIAL_OFFSETS : state.offsetsByPage,
          action.page,
          action.offset,
          action.nextOffset,
        ),
      }
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.error }
    case 'SET_PAGE_SIZE':
      return { ...state, pageSize: action.pageSize, currentPage: 1, offsetsByPage: INITIAL_OFFSETS }
    case 'SET_SORT_DIRECTION':
      return { ...state, sortDirection: action.direction, currentPage: 1, offsetsByPage: INITIAL_OFFSETS }
  }
}

const airtableService = createAirtableService(AIRTABLE_CONFIG)

/**
 * Custom hook for fetching and managing Airtable records
 */
export const useAirtable = () => {
  const [state, dispatch] = useReducer(reducer, initialState)

  const fetchPage = useCallback(
    async(page: number, offset?: string, reset: boolean = false) => {
      try {
        dispatch({ type: 'FETCH_START' })

        const { records, nextOffset } = await airtableService.fetchPage({
          viewName: APP_CONFIG.defaultView,
          pageSize: state.pageSize,
          offset,
          sort: [{ field: APP_CONFIG.defaultSortField, direction: state.sortDirection }],
        })

        dispatch({ type: 'FETCH_SUCCESS', page, records, nextOffset, offset, reset })
      }
      catch(err: unknown) {
        const errorMessage
          = err instanceof Error ? err.message : 'Failed to fetch records from Airtable'
        dispatch({ type: 'FETCH_ERROR', error: errorMessage })
        console.error('Airtable error:', err)
      }
    },
    [state.pageSize, state.sortDirection],
  )

  useEffect(() => {
    void fetchPage(1, undefined, true)
  }, [fetchPage])

  const goToPage = useCallback(
    async(page: number) => {
      if (page < 1 || page === state.currentPage) return
      const offset = page === 1 ? undefined : state.offsetsByPage[page]
      if (page > 1 && !offset) return
      await fetchPage(page, offset)
    },
    [state.currentPage, state.offsetsByPage, fetchPage],
  )

  const setPageSize = useCallback(
    (pageSize: number) => {
      if (pageSize !== state.pageSize) dispatch({ type: 'SET_PAGE_SIZE', pageSize })
    },
    [state.pageSize],
  )

  const setSortDirection = useCallback(
    (direction: AirtableSortDirection) => {
      if (direction !== state.sortDirection) dispatch({ type: 'SET_SORT_DIRECTION', direction })
    },
    [state.sortDirection],
  )

  const refetch = useCallback(async() => {
    const offset = state.currentPage === 1 ? undefined : state.offsetsByPage[state.currentPage]
    await fetchPage(state.currentPage, offset, state.currentPage === 1)
  }, [state.currentPage, state.offsetsByPage, fetchPage])

  const pagination = useMemo<AirtablePaginationState>(() => ({
    currentPage: state.currentPage,
    pageSize: state.pageSize,
    knownPageCount: Math.max(...Object.keys(state.offsetsByPage).map(Number)),
    hasNextPage: state.hasNextPage,
    isLastPageKnown: state.isLastPageKnown,
    pageSizeOptions: APP_CONFIG.pagination.pageSizeOptions,
  }), [state.currentPage, state.pageSize, state.offsetsByPage, state.hasNextPage, state.isLastPageKnown])

  return {
    records: state.records,
    loading: state.loading,
    error: state.error,
    pagination,
    sortDirection: state.sortDirection,
    setSortDirection,
    goToPage,
    setPageSize,
    refetch,
  }
}

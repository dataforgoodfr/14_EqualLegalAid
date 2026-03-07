import type {
  FilterInterface,
  AiretableBaseName,
} from '@/types'

import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'
import { AIRTABLE_FILTER_BASE_NAME } from '@/constants/config'

export const useAirtableFilter = () => {
  const airtableService = useAirtableService()

  const [filterRecords, setFilterRecords] = useState<FilterInterface[]>([])
  const [filterFetched, setFilterFetched] = useState(false)
  const [loadingFilterRecords, setLoadingFilterRecords] = useState(true)
  const [errorFilterRecords, setErrorFilterRecords] = useState<string | null>(null)

  const fetchFilterRecords = useCallback(async() => {
    if (filterFetched) {
      return
    }
    try {
      setLoadingFilterRecords(true)
      setErrorFilterRecords(null)

      const entries = Object.entries(AIRTABLE_FILTER_BASE_NAME) as Array<[string, AiretableBaseName]>
      const results = await Promise.all(
        entries.map(async([key, tableName]) => {
          try {
            const filterRecords = await airtableService.fetchRecordsFromTable({
              tableName: tableName,
              selectConfig: {
                cellFormat: 'json',
                filterByFormula: 'AND({Count_Caselaws} > 0, {Count_Caselaws} != BLANK())',
                sort: [{
                  field: 'Count_Caselaws',
                  direction: 'desc',
                }],
              },
            })
            return {
              label: tableName,
              value: filterRecords,
              available: true,
            } satisfies FilterInterface
          }
          catch {
            return { label: tableName, available: false, value: [] } satisfies FilterInterface
          }
        }),
      )
      setFilterRecords(results)
      setFilterFetched(true)
    }
    catch(err: unknown) {
      const errorMessage
        = err instanceof Error ? err.message : 'Failed to fetch case laws from Airtable'

      setErrorFilterRecords(errorMessage)
      console.error('Airtable case laws error:', err)
    }
    finally {
      setLoadingFilterRecords(false)
    }
  }, [airtableService, filterFetched])

  useEffect(() => {
    fetchFilterRecords()
  }, [fetchFilterRecords])

  return {
    filterRecords,
    loadingFilterRecords,
    errorFilterRecords,
    refetchFilterRecords: fetchFilterRecords,
  }
}

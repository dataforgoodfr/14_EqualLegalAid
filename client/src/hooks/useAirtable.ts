import { useState, useEffect } from 'react'
import { createAirtableService } from '../services/airtableService'
import { AIRTABLE_CONFIG, APP_CONFIG, AIRTABLE_FILTER_BASE_NAME } from '../constants/config'
import type { AirtableRecord, AiretableBaseName } from '../types'
import type { FilterInterface } from '../types/filter'

/**
 * Custom hook for fetching and managing Airtable records
 */
export const useAirtable = () => {
  const [records, setRecords] = useState<AirtableRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<FilterInterface[]>([])
  const [filtersFetched, setFiltersFetched] = useState(false)
  const [filtersLoading, setFiltersLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const airtableService = createAirtableService(AIRTABLE_CONFIG)

  const fetchRecords = async() => {
    try {
      setLoading(true)
      setError(null)
      const fetchedRecords = await airtableService.fetchRecordsFromTable(
        APP_CONFIG.defaultBaseName,
        APP_CONFIG.maxRecords,
      )

      setRecords(fetchedRecords)
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
  }

  const fetchFilters = async() => {
    if (filtersFetched) {
      return
    }
    try {
      setFiltersLoading(true)

      const entries = Object.entries(AIRTABLE_FILTER_BASE_NAME) as Array<[string, AiretableBaseName]>
      const results = await Promise.all(
        entries.map(async([key, tableName]) => {
          try {
            const filterRecords = await airtableService.fetchRecordsFromTable(tableName)
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

      // Tu peux soit garder tout (avec available), soit filtrer.
      const availableOnly = results.filter(f => f.available)
      setFilters(availableOnly)
    }
    finally {
      setFiltersLoading(false)
      setFiltersFetched(true)
    }
  }

  useEffect(() => {
    fetchRecords()
    if (!filtersFetched) {
      fetchFilters()
    }
  }, [])

  return {
    records,

    filters,
    filtersLoading,

    loading,
    error,
    refetch: fetchRecords,
  }
}

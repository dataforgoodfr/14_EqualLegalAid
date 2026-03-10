import type { AirtableRecord } from '@/types'
import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'
import { APP_CONFIG } from '@/constants/config'

export const useAirtableCaselaw = () => {
  const airtableService = useAirtableService()

  const [caselawRecords, setCaselawRecords] = useState<AirtableRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCaseLawsRecords = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const fetchedRecords = await airtableService.fetchRecordsFromTable({
        tableName: APP_CONFIG.defaultBaseName,
      })
      setCaselawRecords(fetchedRecords)
    }
    catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch case laws from Airtable'
      setError(errorMessage)
      console.error('Airtable case laws error:', err)
    }
    finally {
      setLoading(false)
    }
  }, [airtableService])

  const fetchFilteredCaselaws = useCallback(async (caselawIds: string[]) => {
    try {
      setLoading(true)
      setError(null)

      const formula = `OR(${caselawIds.map(id => `RECORD_ID()='${id}'`).join(',')})`

      const fetchedRecords = await airtableService.fetchRecordsFromTable({
        tableName: APP_CONFIG.defaultBaseName,
        selectConfig: {
          filterByFormula: formula,
        },
      })
      setCaselawRecords(fetchedRecords)
    }
    catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch filtered case laws'
      setError(errorMessage)
      console.error('Airtable filtered case laws error:', err)
    }
    finally {
      setLoading(false)
    }
  }, [airtableService])

  useEffect(() => {
    fetchCaseLawsRecords()
  }, [])

  return {
    caselawRecords,
    loading,
    error,
    refetchCaselawRecords: fetchCaseLawsRecords,
    fetchFilteredCaselaws,
  }
}

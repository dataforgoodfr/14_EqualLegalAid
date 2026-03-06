import type { AirtableRecord } from '@/types'
import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'
import { APP_CONFIG } from '@/constants/config'

export const useAirtableCaselaw = () => {
  const airtableService = useAirtableService()

  const [caselawRecords, setCaselawRecords] = useState<AirtableRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCaseLawsRecords = useCallback(async() => {
    try {
      setLoading(true)
      setError(null)

      // Pour l’instant, on fetch tout
      // Ensuite on branchera ici la logique de filtres Airtable
      const fetchedRecords = await airtableService.fetchRecordsFromTable(
        APP_CONFIG.defaultBaseName,
        APP_CONFIG.maxRecords,
      )

      setCaselawRecords(fetchedRecords)
    }
    catch(err: unknown) {
      const errorMessage
        = err instanceof Error ? err.message : 'Failed to fetch case laws from Airtable'

      setError(errorMessage)
      console.error('Airtable case laws error:', err)
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
  }
}

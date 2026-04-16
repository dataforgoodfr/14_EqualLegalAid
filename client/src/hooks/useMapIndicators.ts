import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'
import { toNum, toStr } from '@/lib/utils'

export interface MapIndicatorRecord {
  id: string
  country_code: string
  name_country: string
  year: number
  total_applicants: number
  first_time_applicants: number
  subsequent_applicants: number
  total_applicants_per_capita: number
  first_time_applicants_per_capita: number
  subsequent_applicants_per_capita: number
}

export function useMapIndicators() {
  const airtableService = useAirtableService()
  const [records, setRecords] = useState<MapIndicatorRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = useCallback(async() => {
    try {
      setLoading(true)
      setError(null)
      const raw = await airtableService.fetchRecordsFromTable({
        tableName: 'IND_1_EU_Asylumapplications',
        selectConfig: {
          maxRecords: 5000,
          cellFormat: 'json',
          sort: [{ field: 'year', direction: 'asc' }],
        },
      })
      const parsed: MapIndicatorRecord[] = raw.map(r => ({
        id: r.id,
        country_code: toStr(r.fields['code_country']),
        name_country: toStr(r.fields['name_country']),
        year: toNum(r.fields['year']),
        total_applicants: toNum(r.fields['total_applicants']),
        first_time_applicants: toNum(r.fields['first_time_applicants']),
        subsequent_applicants: toNum(r.fields['subsequent_applicants']),
        total_applicants_per_capita: toNum(r.fields['total_applicants_per_capita']),
        first_time_applicants_per_capita: toNum(r.fields['first_time_applicants_per_capita']),
        subsequent_applicants_per_capita: toNum(r.fields['subsequent_applicants_per_capita']),
      }))
      setRecords(parsed)
    }
    catch(err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch map indicators')
    }
    finally {
      setLoading(false)
    }
  }, [airtableService])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  return { records, loading, error }
}

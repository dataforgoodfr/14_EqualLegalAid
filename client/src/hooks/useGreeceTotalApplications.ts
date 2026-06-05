import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'
import type { AsylumApplicationRecord } from '@/hooks/useAsylumApplications'
import { toNum, toStr } from '@/lib/utils'

export function useGreeceTotalApplications() {
  const airtableService = useAirtableService()

  const [records, setRecords] = useState<AsylumApplicationRecord[]>([])
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
          // https://support.airtable.com/docs/airtable-web-api-using-filterbyformula-or-sort-parameters
          filterByFormula: '{code_country} = "GR"',
        },
      })

      const parsed: AsylumApplicationRecord[] = raw.map(r => ({
        id: r.id,
        year: toNum(r.fields['year']),
        name_country: toStr(r.fields['name_country']),
        total_applicants: toNum(r.fields['total_applicants']),
        first_time_applicants: toNum(r.fields['first_time_applicants']),
        subsequent_applicants: toNum(r.fields['subsequent_applicants']),
        total_country_population: toNum(r.fields['total_country_population']),
        percentage: toNum(r.fields['percentage']),
      }))

      setRecords(parsed)
    }
    catch(err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch greece total application')
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

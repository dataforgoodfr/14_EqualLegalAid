import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'

export interface ApplicationsEvolutionRecord {
  id: string
  year: number
  first_applications: number
  subsequent_applications: number
}

const toNum = (v: unknown): number => {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/,/g, ''))
    return isNaN(n) ? 0 : n
  }
  return 0
}

// year is an Airtable Date field; the API renders it as "YYYY-01-01" or
// "1/1/YYYY" depending on cellFormat/locale, so pull out the 4-digit year
// instead of assuming a fixed position.
const parseYear = (v: unknown): number => {
  const s = typeof v === 'string' ? v : String(v ?? '')
  const match = s.match(/\d{4}/)
  return match ? parseInt(match[0], 10) : 0
}

export function useApplicationsEvolution() {
  const airtableService = useAirtableService()
  const [records, setRecords] = useState<ApplicationsEvolutionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const raw = await airtableService.fetchRecordsFromTable({
        tableName: 'ind5_4_5_applications_per_first_and_subsequent',
        selectConfig: {
          maxRecords: 1000,
          sort: [{ field: 'year', direction: 'asc' }],
        },
      })
      const parsed: ApplicationsEvolutionRecord[] = raw
        .map(r => ({
          id: r.id,
          year: parseYear(r.fields['year']),
          first_applications: toNum(r.fields['first_applications']),
          subsequent_applications: toNum(r.fields['subsequent_applications']),
        }))
        .filter(r => r.year > 0)
        .sort((a, b) => a.year - b.year)
      setRecords(parsed)
    }
    catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch applications evolution data')
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

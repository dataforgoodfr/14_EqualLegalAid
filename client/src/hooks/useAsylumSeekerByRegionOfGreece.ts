import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'
import { toNum, toStr } from '@/lib/utils'

export interface AsylumSeekerByRegionOfGreeceRecord {
  asylum_seekers: number
  region: string
  year: number
}

export function useAsylumSeekerByRegionOfGreece() {
  const airtableService = useAirtableService()

  const [records, setRecords] = useState<AsylumSeekerByRegionOfGreeceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = useCallback(async() => {
    try {
      setLoading(true)
      setError(null)

      const raw = await airtableService.fetchRecordsFromTable({
        tableName: 'ind4_asylum_seekers_in_greece',
        selectConfig: {
          maxRecords: 5000,
          cellFormat: 'json',
          // sort: [{ field: 'year', direction: 'asc' }],
          // https://support.airtable.com/docs/airtable-web-api-using-filterbyformula-or-sort-parameters
          // filterByFormula: '{code_country} = "GR"',
        },
      })

      // EXAMPLE OF DATA
      // area: "Sites (2: Koutsocherro, Volos)"
      // asylum_seekers: "1578"
      // date: "2026-01-01"
      // location: "Southern Greece"
      // month: 1
      // region: "Thessaly"
      // year: 2026

      const parsed: AsylumSeekerByRegionOfGreeceRecord[] = raw.map(r => ({
        asylum_seekers: toNum(r.fields['asylum_seekers']),
        region: toStr(r.fields['region']),
        year: toNum(r.fields['year']),
      }))

      setRecords(parsed)
    }
    catch(err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch asylum seeker data by greek regions')
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

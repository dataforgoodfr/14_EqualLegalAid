import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'

export interface AsylumSeekersCampsRecord {
  id: string
  date: string
  year: number
  month: number
  asylum_seekers: number
  type: string
  area: string
  region: string
  location: string
}

const toNum = (v: unknown): number => {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/,/g, ''))
    return isNaN(n) ? 0 : n
  }
  return 0
}

const toStr = (v: unknown): string =>
  typeof v === 'string' ? v : String(v ?? '')

export function useAsylumSeekersCamps() {
  const airtableService = useAirtableService()
  const [records, setRecords] = useState<AsylumSeekersCampsRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const raw = await airtableService.fetchRecordsFromTable({
        tableName: 'ind4_asylum_seekers_in_greece',
        selectConfig: {
          maxRecords: 5000,
          sort: [{ field: 'date', direction: 'asc' }],
        },
      })
      const parsed: AsylumSeekersCampsRecord[] = raw.map(r => ({
        id: r.id,
        date: toStr(r.fields['date']),
        year: toNum(r.fields['year']),
        month: toNum(r.fields['month']),
        // asylum_seekers is stored as a STRING in Airtable
        asylum_seekers: toNum(r.fields['asylum_seekers']),
        area: toStr(r.fields['area']),
        type: toStr(r.fields['type']),
        region: toStr(r.fields['region']),
        location: toStr(r.fields['location']),
      }))
      setRecords(parsed)
    }
    catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch asylum seekers data')
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

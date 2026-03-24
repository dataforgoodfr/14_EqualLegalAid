import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'

export interface AsylumSeekersRegionRecord {
  id: string
  region: string
  residents_by_region: number
  sites: number
  ccac_ric: number
  // missing whole field name:
  // total_asylum_seekers?: number
  // percentage_total?: number
}

const toNum = (v: unknown): number => {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/,/g, ''))
    return isNaN(n) ? 0 : n
  }
  return 0
}

export const useAsylumSeekersRegion= () => {
  const airtableService = useAirtableService()

  const [records, setRecords] = useState<AsylumSeekersRegionRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = useCallback(async() => {
    try {
      setLoading(true)
      setError(null)

      const raw = await airtableService.fetchRecordsFromTable({
        tableName: 'Ind5_Asylum seekers_Region',
        selectConfig: {
          maxRecords: 5000,
          cellFormat: 'json',
          // sort: [{ field: 'year', direction: 'asc' }],
        },
      })

      const parsed: AsylumSeekersRegionRecord[] = raw.map(r => ({
        id: r.id,
        region: String(r.fields['region']),
        residents_by_region: toNum(r.fields['residents_by_region']),
        sites: toNum(r.fields['sites']),
        ccac_ric: toNum(r.fields['ccac_ric']),
      }))

      setRecords(parsed)
    }
    catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch asylum arrivals')
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

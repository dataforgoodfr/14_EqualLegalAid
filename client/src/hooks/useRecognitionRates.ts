import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'

export interface RecognitionRateRecord {
  id: string
  year: number
  refugee_status_first: number
  subsidiary_protection_first: number
  refugee_status_second: number
  subsidiary_protection_second: number
  total_decisions_first: number
  recognition_rate_first: number
  recognition_rate_second: number
}

const toNum = (v: unknown): number => {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/,/g, ''))
    return isNaN(n) ? 0 : n
  }
  return 0
}

// year field is stored as "YYYY-01-01" date string
const parseYear = (v: unknown): number => {
  const s = typeof v === 'string' ? v : String(v ?? '')
  return parseInt(s.slice(0, 4), 10) || 0
}

export function useRecognitionRates() {
  const airtableService = useAirtableService()
  const [records, setRecords] = useState<RecognitionRateRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const raw = await airtableService.fetchRecordsFromTable({
        tableName: 'ind10_recognition_rates',
        selectConfig: {
          maxRecords: 1000,
          sort: [{ field: 'year', direction: 'asc' }],
        },
      })
      const parsed: RecognitionRateRecord[] = raw
        .map(r => {
          const refugeeFirst = toNum(r.fields['refugee_status_first_instance_mom_table'])
          const subFirst = toNum(r.fields['subsidiary_protection_first_instance_mom_table'])
          const refugeeSecond = toNum(r.fields['refugee_status_second_instance'])
          const subSecond = toNum(r.fields['subsidiary_protection_second_instance'])
          const totalFirst = toNum(r.fields['total_decisions_issued_first_instance'])
          const positiveFirst = refugeeFirst + subFirst
          const positiveSecond = refugeeSecond + subSecond
          return {
            id: r.id,
            year: parseYear(r.fields['year']),
            refugee_status_first: refugeeFirst,
            subsidiary_protection_first: subFirst,
            refugee_status_second: refugeeSecond,
            subsidiary_protection_second: subSecond,
            total_decisions_first: totalFirst,
            recognition_rate_first: totalFirst > 0 ? Math.round((positiveFirst / totalFirst) * 1000) / 10 : 0,
            recognition_rate_second: positiveSecond,
          }
        })
        .filter(r => r.year > 0)
        .sort((a, b) => a.year - b.year)
      setRecords(parsed)
    }
    catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recognition rates data')
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

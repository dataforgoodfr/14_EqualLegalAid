import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'

export interface RecognitionRateRecord {
  id: string
  year: number
  refugee_status_first: number
  subsidiary_protection_first: number
  rejected_first: number
  total_first: number
  refugee_status_second: number
  subsidiary_protection_second: number
  rejected_second: number
  total_second: number
  international_protection_rate: number
  subsidiary_protection_rate: number
  rejection_rate: number
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

// Data before 2022 is incomplete in Airtable (missing total-decisions fields),
// so this indicator only covers 2022 onward.
const FIRST_COMPLETE_YEAR = 2022

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
        .map((r) => {
          const refugeeFirst = toNum(r.fields['refugee_status_first_instance_mom_table'])
          const subFirst = toNum(r.fields['subsidiary_protection_first_instance_mom_table'])
          const totalFirst = toNum(r.fields['total_decisions_issued_first_instance'])
          const rejectedFirst = Math.max(0, totalFirst - refugeeFirst - subFirst)

          const refugeeSecond = toNum(r.fields['refugee_status_second_instance_mom_apdx'])
          const subSecond = toNum(r.fields['subsidiary_protection_second_instance_mom_apdx'])
          const totalSecond = toNum(r.fields['total_decisions_issued_second_instance_mom_apdx'])
          const rejectedSecond = Math.max(0, totalSecond - refugeeSecond - subSecond)

          const combinedTotal = totalFirst + totalSecond

          return {
            id: r.id,
            year: parseYear(r.fields['year']),
            refugee_status_first: refugeeFirst,
            subsidiary_protection_first: subFirst,
            rejected_first: rejectedFirst,
            total_first: totalFirst,
            refugee_status_second: refugeeSecond,
            subsidiary_protection_second: subSecond,
            rejected_second: rejectedSecond,
            total_second: totalSecond,
            international_protection_rate: combinedTotal > 0
              ? Math.round(((refugeeFirst + refugeeSecond) / combinedTotal) * 1000) / 10
              : 0,
            subsidiary_protection_rate: combinedTotal > 0
              ? Math.round(((subFirst + subSecond) / combinedTotal) * 1000) / 10
              : 0,
            rejection_rate: combinedTotal > 0
              ? Math.round(((rejectedFirst + rejectedSecond) / combinedTotal) * 1000) / 10
              : 0,
          }
        })
        .filter(r => r.year >= FIRST_COMPLETE_YEAR)
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

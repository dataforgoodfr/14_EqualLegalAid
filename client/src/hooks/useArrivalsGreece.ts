import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'

export interface ArrivalsGreeceRecord {
  id: string
  date: string
  year: number
  month: number
  total_arrivals: number
  total_arrivals_land: number
  total_arrivals_sea: number
  evros: number
  lesvos: number
  samos: number
  leros: number
  kos: number
  chios: number
  other_islands: number
}

export interface ArrivalsGreeceYearly {
  year: number
  total_arrivals: number
  total_arrivals_land: number
  total_arrivals_sea: number
  evros: number
  lesvos: number
  samos: number
  leros: number
  kos: number
  chios: number
  other_islands: number
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

export function useArrivalsGreece() {
  const airtableService = useAirtableService()
  const [records, setRecords] = useState<ArrivalsGreeceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const raw = await airtableService.fetchRecordsFromTable({
        tableName: 'v2_ind3_arrivals_greece',
        selectConfig: {
          maxRecords: 5000,
          sort: [{ field: 'date', direction: 'asc' }],
        },
      })
      const parsed: ArrivalsGreeceRecord[] = raw.map(r => ({
        id: r.id,
        date: toStr(r.fields['date']),
        year: toNum(r.fields['year']),
        month: toNum(r.fields['month']),
        total_arrivals: toNum(r.fields['total_arrivals']),
        total_arrivals_land: toNum(r.fields['total_arrivals_land']),
        total_arrivals_sea: toNum(r.fields['total_arrivals_sea']),
        evros: toNum(r.fields['Evros']),
        lesvos: toNum(r.fields['Lesvos']),
        samos: toNum(r.fields['Samos']),
        leros: toNum(r.fields['Leros']),
        kos: toNum(r.fields['Kos']),
        chios: toNum(r.fields['Chios']),
        other_islands: toNum(r.fields['Other _islands']),
      }))
      setRecords(parsed)
    }
    catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch arrivals data')
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

export function aggregateByYear(records: ArrivalsGreeceRecord[]): ArrivalsGreeceYearly[] {
  const map = new Map<number, ArrivalsGreeceYearly>()
  for (const r of records) {
    const existing = map.get(r.year)
    if (existing) {
      existing.total_arrivals += r.total_arrivals
      existing.total_arrivals_land += r.total_arrivals_land
      existing.total_arrivals_sea += r.total_arrivals_sea
      existing.evros += r.evros
      existing.lesvos += r.lesvos
      existing.samos += r.samos
      existing.leros += r.leros
      existing.kos += r.kos
      existing.chios += r.chios
      existing.other_islands += r.other_islands
    }
    else {
      map.set(r.year, { ...r })
    }
  }
  return Array.from(map.values()).sort((a, b) => a.year - b.year)
}

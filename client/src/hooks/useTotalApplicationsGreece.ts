import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'

// La table porte deux séries dans les mêmes colonnes, distinguées par `month` :
//   - `month` vide  -> total annuel officiel, consolidé par la source grecque
//   - `month` 1..12 -> relevé mensuel publié au fil de l'eau
// Les deux ne coïncident pas toujours (révisions), c'est voulu — voir
// `annualTotals` plus bas pour la règle d'arbitrage.
export interface TotalApplicationsRecord {
  id: string
  year: number
  month: number | null
  total_applications: number
  first_applications: number | null
  subsequent_applications: number | null
}

const toNum = (v: unknown): number => {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = parseFloat(v.replace(/,/g, ''))
    return isNaN(n) ? 0 : n
  }
  return 0
}

const toNumOrNull = (v: unknown): number | null =>
  v === undefined || v === null || v === '' ? null : toNum(v)

export function useTotalApplicationsGreece() {
  const airtableService = useAirtableService()
  const [records, setRecords] = useState<TotalApplicationsRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = useCallback(async() => {
    try {
      setLoading(true)
      setError(null)
      const raw = await airtableService.fetchRecordsFromTable({
        tableName: 'ind5_total_applications_in_greece',
        selectConfig: { maxRecords: 1000 },
      })
      const parsed: TotalApplicationsRecord[] = raw
        .map(r => ({
          id: r.id,
          year: toNum(r.fields['year']),
          month: toNumOrNull(r.fields['month']),
          total_applications: toNum(r.fields['total_applications']),
          first_applications: toNumOrNull(r.fields['first_applications']),
          subsequent_applications: toNumOrNull(r.fields['subsequent_applications']),
        }))
        .filter(r => r.year > 0)
      setRecords(parsed)
    }
    catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch total applications data')
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

export interface YearlyTotal {
  year: number
  total_applications: number
  first_applications: number | null
  subsequent_applications: number | null
  /** true quand la valeur vient de la somme des mois faute de consolidé officiel. */
  fromMonthly: boolean
}

/**
 * Valeur annuelle par année. Le total officiel prime : c'est lui que publie la
 * source grecque, révisions comprises. La somme des mois ne sert que de repli
 * pour l'année en cours, qui n'a pas encore son consolidé.
 */
export function annualTotals(records: TotalApplicationsRecord[]): YearlyTotal[] {
  const official = new Map<number, TotalApplicationsRecord>()
  const summed = new Map<number, YearlyTotal>()

  for (const r of records) {
    if (r.month === null) {
      official.set(r.year, r)
      continue
    }
    const acc = summed.get(r.year) ?? {
      year: r.year,
      total_applications: 0,
      first_applications: 0,
      subsequent_applications: 0,
      fromMonthly: true,
    }
    acc.total_applications += r.total_applications
    acc.first_applications = (acc.first_applications ?? 0) + (r.first_applications ?? 0)
    acc.subsequent_applications = (acc.subsequent_applications ?? 0) + (r.subsequent_applications ?? 0)
    summed.set(r.year, acc)
  }

  const years = new Set([...official.keys(), ...summed.keys()])
  return Array.from(years)
    .sort((a, b) => a - b)
    .map((year) => {
      const off = official.get(year)
      if (off) {
        return {
          year,
          total_applications: off.total_applications,
          first_applications: off.first_applications,
          subsequent_applications: off.subsequent_applications,
          fromMonthly: false,
        }
      }
      return summed.get(year)!
    })
}

/** Série mensuelle triée, années sans mois exclues. */
export function monthlySeries(records: TotalApplicationsRecord[]) {
  return records
    .filter(r => r.month !== null)
    .sort((a, b) => a.year - b.year || (a.month! - b.month!))
    .map(r => ({
      key: `${r.year}-${String(r.month).padStart(2, '0')}`,
      year: r.year,
      month: r.month as number,
      total_applications: r.total_applications,
      first_applications: r.first_applications ?? 0,
      subsequent_applications: r.subsequent_applications ?? 0,
    }))
}

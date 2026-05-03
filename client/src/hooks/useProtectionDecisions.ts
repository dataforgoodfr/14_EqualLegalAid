import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'

export interface FirstInstanceRecord {
  id: string
  date: string
  year: number
  month: number
  refugee_status: number
  subsidiary_protection: number
  rejected_as_unfounded: number
  formal_grounds_rejections: number
  explicit_withdrawals: number
  implicit_withdrawals: number
  negative_first_instance: number
  negative_accelerated: number
  border_procedure: number
  dublin_regulation: number
  exclusion_from_refugee_status: number
  subsequent_applications: number
  filling_cases_decisions: number
}

export interface SecondInstanceRecord {
  id: string
  date: string
  year: number
  month: number
  refugee_status: number
  subsidiary_protection: number
  rejected_as_unfounded: number
  formal_grounds_rejections: number
  explicit_withdrawals: number
  implicit_withdrawals: number
}

export interface DecisionsYearly {
  year: number
  refugee_status: number
  subsidiary_protection: number
  positive: number
  rejected_as_unfounded: number
  formal_grounds_rejections: number
  explicit_withdrawals: number
  implicit_withdrawals: number
  negative: number
  total: number
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

export function useProtectionDecisions() {
  const airtableService = useAirtableService()
  const [firstInstance, setFirstInstance] = useState<FirstInstanceRecord[]>([])
  const [secondInstance, setSecondInstance] = useState<SecondInstanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [rawFirst, rawSecond] = await Promise.all([
        airtableService.fetchRecordsFromTable({
          tableName: 'ind6_first_instance_decisions',
          selectConfig: {
            maxRecords: 5000,
            sort: [{ field: 'date', direction: 'asc' }],
          },
        }),
        airtableService.fetchRecordsFromTable({
          tableName: 'ind9_second_instance_decisions',
          selectConfig: {
            maxRecords: 5000,
            sort: [{ field: 'Calculation', direction: 'asc' }],
          },
        }),
      ])

      const parsedFirst: FirstInstanceRecord[] = rawFirst.map(r => ({
        id: r.id,
        date: toStr(r.fields['date']),
        year: toNum(r.fields['year']),
        month: toNum(r.fields['month']),
        refugee_status: toNum(r.fields['refugee_status']),
        subsidiary_protection: toNum(r.fields['subsidiary_protection']),
        rejected_as_unfounded: toNum(r.fields['rejected_as_unfounded']),
        formal_grounds_rejections: toNum(r.fields['formal_grounds_rejections']),
        explicit_withdrawals: toNum(r.fields['explicit_withdrawals']),
        implicit_withdrawals: toNum(r.fields['implicit_withdrawals']),
        negative_first_instance: toNum(r.fields['negative_first_instance']),
        negative_accelerated: toNum(r.fields['negative_after_examination_under_accelerated_procedure']),
        border_procedure: toNum(r.fields['border_procedure']),
        dublin_regulation: toNum(r.fields['dublin_regulation']),
        // field name has a space: "exclusion_from_ refugee_status"
        exclusion_from_refugee_status: toNum(r.fields['exclusion_from_ refugee_status']),
        subsequent_applications: toNum(r.fields['subsequent_applications']),
        filling_cases_decisions: toNum(r.fields['filling_cases_decisions']),
      }))

      const parsedSecond: SecondInstanceRecord[] = rawSecond.map(r => ({
        id: r.id,
        // ind9 uses "Calculation" as the date field name
        date: toStr(r.fields['Calculation']),
        year: toNum(r.fields['year']),
        month: toNum(r.fields['month']),
        refugee_status: toNum(r.fields['refugee_status']),
        subsidiary_protection: toNum(r.fields['subsidiary_protection']),
        rejected_as_unfounded: toNum(r.fields['rejected_as_unfounded']),
        formal_grounds_rejections: toNum(r.fields['formal_grounds_rejections']),
        explicit_withdrawals: toNum(r.fields['explicit_withdrawals']),
        implicit_withdrawals: toNum(r.fields['implicit_withdrawals']),
      }))

      setFirstInstance(parsedFirst)
      setSecondInstance(parsedSecond)
    }
    catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch protection decisions data')
    }
    finally {
      setLoading(false)
    }
  }, [airtableService])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  return { firstInstance, secondInstance, loading, error }
}

export function aggregateDecisionsByYear(records: (FirstInstanceRecord | SecondInstanceRecord)[]): DecisionsYearly[] {
  const map = new Map<number, DecisionsYearly>()
  for (const r of records) {
    const existing = map.get(r.year)
    const positive = r.refugee_status + r.subsidiary_protection
    const negative = r.rejected_as_unfounded + r.formal_grounds_rejections + r.explicit_withdrawals + r.implicit_withdrawals
    if (existing) {
      existing.refugee_status += r.refugee_status
      existing.subsidiary_protection += r.subsidiary_protection
      existing.positive += positive
      existing.rejected_as_unfounded += r.rejected_as_unfounded
      existing.formal_grounds_rejections += r.formal_grounds_rejections
      existing.explicit_withdrawals += r.explicit_withdrawals
      existing.implicit_withdrawals += r.implicit_withdrawals
      existing.negative += negative
      existing.total += positive + negative
    }
    else {
      map.set(r.year, {
        year: r.year,
        refugee_status: r.refugee_status,
        subsidiary_protection: r.subsidiary_protection,
        positive,
        rejected_as_unfounded: r.rejected_as_unfounded,
        formal_grounds_rejections: r.formal_grounds_rejections,
        explicit_withdrawals: r.explicit_withdrawals,
        implicit_withdrawals: r.implicit_withdrawals,
        negative,
        total: positive + negative,
      })
    }
  }
  return Array.from(map.values()).sort((a, b) => a.year - b.year)
}

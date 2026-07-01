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
  protection_rate: number
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
  protection_rate: number
}

export interface ProtectionRatePerMonthRecord {
  first_instance_protection_rate: number
  second_instance_protection_rate: number
  display_date: string
}

export interface DecisionsYearly {
  year: number
  refugee_status: number
  subsidiary_protection: number
  positive: number
  rejected_as_unfounded: number
  exclusion_from_refugee_status: number
  negative_first_instance: number
  negative_accelerated: number
  rejection_on_merits: number
  formal_grounds_rejections: number
  explicit_withdrawals: number
  implicit_withdrawals: number
  withdrawals_archived: number
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
            sort: [{ field: 'date', direction: 'asc' }],
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
        exclusion_from_refugee_status: toNum(r.fields['exclusion_from_refugee_status']),
        subsequent_applications: toNum(r.fields['subsequent_applications']),
        filling_cases_decisions: toNum(r.fields['filling_cases_decisions']),
        protection_rate: toNum(r.fields['protection_rate']),
      }))

      const parsedSecond: SecondInstanceRecord[] = rawSecond.map(r => ({
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
        protection_rate: toNum(r.fields['protection_rate']),
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
    const isFirst = 'negative_first_instance' in r
    const exclusion = isFirst ? (r as FirstInstanceRecord).exclusion_from_refugee_status : 0
    const negFirst = isFirst ? (r as FirstInstanceRecord).negative_first_instance : 0
    const negAccel = isFirst ? (r as FirstInstanceRecord).negative_accelerated : 0
    const positive = r.refugee_status + r.subsidiary_protection
    const rejection_on_merits = r.rejected_as_unfounded + exclusion + negFirst + negAccel
    const withdrawals_archived = r.explicit_withdrawals + r.implicit_withdrawals
    const negative = rejection_on_merits + r.formal_grounds_rejections + withdrawals_archived
    const existing = map.get(r.year)
    if (existing) {
      existing.refugee_status += r.refugee_status
      existing.subsidiary_protection += r.subsidiary_protection
      existing.positive += positive
      existing.rejected_as_unfounded += r.rejected_as_unfounded
      existing.exclusion_from_refugee_status += exclusion
      existing.negative_first_instance += negFirst
      existing.negative_accelerated += negAccel
      existing.rejection_on_merits += rejection_on_merits
      existing.formal_grounds_rejections += r.formal_grounds_rejections
      existing.explicit_withdrawals += r.explicit_withdrawals
      existing.implicit_withdrawals += r.implicit_withdrawals
      existing.withdrawals_archived += withdrawals_archived
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
        exclusion_from_refugee_status: exclusion,
        negative_first_instance: negFirst,
        negative_accelerated: negAccel,
        rejection_on_merits,
        formal_grounds_rejections: r.formal_grounds_rejections,
        explicit_withdrawals: r.explicit_withdrawals,
        implicit_withdrawals: r.implicit_withdrawals,
        withdrawals_archived,
        negative,
        total: positive + negative,
      })
    }
  }
  return Array.from(map.values()).sort((a, b) => a.year - b.year)
}

export function protectionRatePerMonth(firstInstanceRecords: FirstInstanceRecord[], secondInstanceRecord:SecondInstanceRecord[]) {

// we wish to create an array of objects
  // example :
  // const chartData = [
  //   {
  //     first_instance_protection_rate: 5,
  //     second_instance_protection_rate: 10,
  //     display_date: firstInstance[0].display_date
  //   },
  //   {
  //     first_instance_protection_rate: 5,
  //     second_instance_protection_rate: 10,
  //     display_date: firstInstance[1].display_date
  //   },
  //   {
  //     first_instance_protection_rate: 5,
  //     second_instance_protection_rate: 10,
  //     display_date: firstInstance[2].display_date
  //   }
  // ]
  
  // to do so, we create a map, we take the values of the two arguments one by one
  const map = new Map<string, ProtectionRatePerMonthRecord>()
  
  // example : map = {
  //   {
  //     '2020 / 10',
  //     {first_instance_protection_rate: 5,second_instance_protection_rate: 10,display_date: 2020 / 5}
  //   }
  // }

  firstInstanceRecords.forEach(record => {
    const key = record.date
    const chartData = {
      first_instance_protection_rate: record.protection_rate,
      second_instance_protection_rate: 0,
      display_date: `${record.year} / ${record.month}`
    }
    map.set(key, chartData)
  });

  secondInstanceRecord.forEach(record => {
    const key = record.date
    const second_instance_protection_rate = record.protection_rate
    const existing_record = map.get(key)
    if(existing_record){
      existing_record.second_instance_protection_rate = second_instance_protection_rate
    }else{
      const chartData = {
        "first_instance_protection_rate": 0,
        "second_instance_protection_rate": second_instance_protection_rate,
        display_date: `${record.year} / ${record.month}`
      }
      map.set(key, chartData)
    }
  });

  return Array.from(map.values())
}
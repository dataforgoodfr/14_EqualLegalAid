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
  rejected_as_manifestly_unfounded: number
  rejected_as_manifestly_unfounded_safe_country: number
  rejected_other: number
  exclusion_from_refugee_status: number
  revocation_of_protection_status: number
  formal_grounds_rejections: number
  border_procedure: number
  dublin_regulation: number
  subsequent_applications: number
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
  // Rejection on the merits
  rejected_as_unfounded: number
  exclusion_from_refugee_status: number
  negative_first_instance: number
  negative_accelerated: number
  rejected_as_manifestly_unfounded: number
  rejected_as_manifestly_unfounded_safe_country: number
  revocation_of_protection_status: number
  rejected_other: number
  rejection_on_merits: number
  // Rejection as inadmissible
  border_procedure: number
  dublin_regulation: number
  subsequent_applications: number
  formal_grounds_rejections: number
  rejection_inadmissible: number
  // Withdrawals
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
        rejected_as_unfounded: toNum(r.fields['Rejection_on_the_merits_Rejected_as_unfounded']),
        rejected_as_manifestly_unfounded: toNum(r.fields['Rejection_on_the_merits_Rejected_as_manifestly_unfounded']),
        rejected_as_manifestly_unfounded_safe_country: toNum(r.fields['Rejection_on_the_merits_Rejected_as_manifestly_unfounded_Safe_country_of_origin']),
        rejected_other: toNum(r.fields['Rejection_on_the_merits_Rejected']),
        exclusion_from_refugee_status: toNum(r.fields['Rejection_on_the_merits_Exclusion_from_refugee_status']),
        revocation_of_protection_status: toNum(r.fields['Rejection_on_the_merits_Revocation_of_protection_status']),
        formal_grounds_rejections: toNum(r.fields['Rejection_on_formal_grounds']),
        border_procedure: toNum(r.fields['Border_procedure_Safe_Third_Country']) + toNum(r.fields['Border_procedure_Safe_Third_Country_ALBANIA']) + toNum(r.fields['Border_procedure_Safe_Third_Country_NORTH_MACEDONIA']),
        dublin_regulation: toNum(r.fields['Dublin_Regulation']),
        subsequent_applications: toNum(r.fields['Subsequent_Applications']),
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
    const negFirst = isFirst ? (r as FirstInstanceRecord).negative_first_instance : 0
    const negAccel = isFirst ? (r as FirstInstanceRecord).negative_accelerated : 0
    const manifestlyUnfounded = !isFirst ? (r as SecondInstanceRecord).rejected_as_manifestly_unfounded : 0
    const manifestlyUnfoundedSafeCountry = !isFirst ? (r as SecondInstanceRecord).rejected_as_manifestly_unfounded_safe_country : 0
    const revocation = !isFirst ? (r as SecondInstanceRecord).revocation_of_protection_status : 0
    const rejectedOther = !isFirst ? (r as SecondInstanceRecord).rejected_other : 0

    const positive = r.refugee_status + r.subsidiary_protection
    const rejection_on_merits = r.rejected_as_unfounded + r.exclusion_from_refugee_status + negFirst + negAccel
      + manifestlyUnfounded + manifestlyUnfoundedSafeCountry + revocation + rejectedOther
    const rejection_inadmissible = r.border_procedure + r.dublin_regulation + r.subsequent_applications + r.formal_grounds_rejections
    const withdrawals_archived = r.explicit_withdrawals + r.implicit_withdrawals
    const negative = rejection_on_merits + rejection_inadmissible + withdrawals_archived
    const existing = map.get(r.year)
    if (existing) {
      existing.refugee_status += r.refugee_status
      existing.subsidiary_protection += r.subsidiary_protection
      existing.positive += positive
      existing.rejected_as_unfounded += r.rejected_as_unfounded
      existing.exclusion_from_refugee_status += r.exclusion_from_refugee_status
      existing.negative_first_instance += negFirst
      existing.negative_accelerated += negAccel
      existing.rejected_as_manifestly_unfounded += manifestlyUnfounded
      existing.rejected_as_manifestly_unfounded_safe_country += manifestlyUnfoundedSafeCountry
      existing.revocation_of_protection_status += revocation
      existing.rejected_other += rejectedOther
      existing.rejection_on_merits += rejection_on_merits
      existing.border_procedure += r.border_procedure
      existing.dublin_regulation += r.dublin_regulation
      existing.subsequent_applications += r.subsequent_applications
      existing.formal_grounds_rejections += r.formal_grounds_rejections
      existing.rejection_inadmissible += rejection_inadmissible
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
        exclusion_from_refugee_status: r.exclusion_from_refugee_status,
        negative_first_instance: negFirst,
        negative_accelerated: negAccel,
        rejected_as_manifestly_unfounded: manifestlyUnfounded,
        rejected_as_manifestly_unfounded_safe_country: manifestlyUnfoundedSafeCountry,
        revocation_of_protection_status: revocation,
        rejected_other: rejectedOther,
        rejection_on_merits,
        border_procedure: r.border_procedure,
        dublin_regulation: r.dublin_regulation,
        subsequent_applications: r.subsequent_applications,
        formal_grounds_rejections: r.formal_grounds_rejections,
        rejection_inadmissible,
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
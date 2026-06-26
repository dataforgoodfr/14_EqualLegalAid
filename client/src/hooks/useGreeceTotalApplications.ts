import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'
import type { AsylumApplicationRecord } from '@/hooks/useAsylumApplications'
import { toNum, toStr } from '@/lib/utils'

export interface AsylumApplicationRecords {
  byPeriod: AsylumApplicationRecord[],
  byNationality: AsylumApplicationByNationalityRecord[],
  byGenderAge: AsylumApplicationByGenderAgeRecord[],
}

export interface AsylumApplicationByNationalityRecord {
  id: string
  year: number
  country: string
  total_applications: number
  islands_applications: number
  mainland_applications: number
}

export interface AsylumApplicationByGenderAgeRecord {
  id: string
  year: number
  age: string
  gender: string
  applications: number
}

export function useGreeceTotalApplications() {
  const airtableService = useAirtableService()

  const [recordsByPeriod, setRecordsByPeriod] = useState<AsylumApplicationRecord[]>([])
  const [recordsByNationality, setRecordsByNationality] = useState<AsylumApplicationByNationalityRecord[]>([])
  const [recordsByGenderAge, setRecordsByGenderAge] = useState<AsylumApplicationByGenderAgeRecord[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const rawPeriod = await airtableService.fetchRecordsFromTable({
        tableName: 'IND_1_EU_Asylumapplications',
        selectConfig: {
          maxRecords: 5000,
          cellFormat: 'json',
          sort: [{ field: 'year', direction: 'asc' }],
          // https://support.airtable.com/docs/airtable-web-api-using-filterbyformula-or-sort-parameters
          filterByFormula: '{code_country} = "GR"',
        },
      })

      const parsedPeriod: AsylumApplicationRecord[] = rawPeriod.map(r => ({
        id: r.id,
        year: toNum(r.fields['year']),
        name_country: toStr(r.fields['name_country']),
        total_applicants: toNum(r.fields['total_applicants']),
        first_time_applicants: toNum(r.fields['first_time_applicants']),
        subsequent_applicants: toNum(r.fields['subsequent_applicants']),
        total_country_population: toNum(r.fields['total_country_population']),
        percentage: toNum(r.fields['percentage']),
      }))

      setRecordsByPeriod(parsedPeriod)


      const rawNationality = await airtableService.fetchRecordsFromTable({
        tableName: 'ind5_1_6_applications_per_country_and_location',
        selectConfig: {
          maxRecords: 5000,
          cellFormat: 'json',
          sort: [{ field: 'year', direction: 'asc' }],
        },
      })

      const parsedNationality: AsylumApplicationByNationalityRecord[] = rawNationality.map(r => ({
        id: r.id,
        year: (
          // In the format `1/1/2025`
          toNum(toStr(r.fields['year']).split('/').pop())
        ),
        country: toStr(r.fields['country']),
        islands_applications: toNum(r.fields['islands_applications']),
        mainland_applications: toNum(r.fields['mainland_applications']),
        total_applications: toNum(r.fields['islands_applications']) + toNum(r.fields['mainland_applications']),
      }))

      setRecordsByNationality(parsedNationality);

      const rawGenderAge = await airtableService.fetchRecordsFromTable({
        tableName: 'ind5_2_3_applications_per_gender_and_age',
        selectConfig: {
          maxRecords: 5000,
          cellFormat: 'json',
          sort: [{ field: 'year', direction: 'asc' }],
        },
      })

      const parsedGenderAge: AsylumApplicationByGenderAgeRecord[] = rawGenderAge.map(r => ({
        id: r.id,
        year: (
          // In the format `1/1/2025`
          toNum(toStr(r.fields['year']).split('/').pop())
        ),
        age: toStr(r.fields['age']),
        gender: toStr(r.fields['gender']),
        applications: toNum(r.fields['applications']),
      }))

      setRecordsByGenderAge(parsedGenderAge);
    }
    catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch greece total application')
    }
    finally {
      setLoading(false)
    }
  }, [airtableService])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  return {
    records: {
      byPeriod: recordsByPeriod,
      byNationality: recordsByNationality,
      byGenderAge: recordsByGenderAge,
    }, loading, error
  }
}

import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'
import { toNum, toStr } from '@/lib/utils'

interface AsylumSeekerByRegionOfGreeceRawRecord {
  asylum_seekers: number
  region: string
  year: number
}

export type yearRegionMapOfMap = Map<number, Map<string, number>> | null

export function useAsylumSeekerByRegionOfGreeceWithEmptyData() {
  const records = new Map<number, Map<string, number>>()
  const loading = false
  const error = null

  // create a unique data
  const regionMap = new Map<string, number>()
  regionMap.set('Thessaly', 100)
  records.set(2026, regionMap)

  return { records, loading, error }
}

export function useAsylumSeekerByRegionOfGreece() {
  const airtableService = useAirtableService()

  const [records, setRecords] = useState<yearRegionMapOfMap>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = useCallback(async() => {
    try {
      setLoading(true)
      setError(null)

      const raw = await airtableService.fetchRecordsFromTable({
        tableName: 'ind4_asylum_seekers_in_greece',
        selectConfig: {
          maxRecords: 50,
          cellFormat: 'json',
          // sort: [{ field: 'year', direction: 'asc' }],
          // https://support.airtable.com/docs/airtable-web-api-using-filterbyformula-or-sort-parameters
          // filterByFormula: '{code_country} = "GR"',
        },
      })

      // EXAMPLE OF DATA
      // area: "Sites (2: Koutsocherro, Volos)"
      // asylum_seekers: "1578"
      // date: "2026-01-01"
      // location: "Southern Greece"
      // month: 1
      // region: "Thessaly"
      // year: 2026

      const parsedRecords: AsylumSeekerByRegionOfGreeceRawRecord[] = raw.map(r => ({
        asylum_seekers: toNum(r.fields['asylum_seekers']),
        region: toStr(r.fields['region']),
        year: toNum(r.fields['year']),
      }))

      // use a Map of Map to aggregate the value by year and by region
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
      // might be rewritten with Map.groupBy()
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/groupBy
      const yearMap = new Map<number, Map<string, number>>()
      for (const record of parsedRecords) {
        const year = record.year
        const existingYear = yearMap.has(year)
        if (existingYear) {
          const currentYearMap = yearMap.get(year)
          const region = record.region
          const previousAsylumSeekersValue: number = currentYearMap?.get(region) ?? 0
          const newAsylumSeekersValue: number = previousAsylumSeekersValue + record.asylum_seekers
          currentYearMap?.set(region, newAsylumSeekersValue)
        }
        else {
          const regionMap = new Map<string, number>()
          yearMap.set(year, regionMap)
        }
      }
      setRecords(yearMap)
    }
    catch(err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch asylum seeker data by greek regions')
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

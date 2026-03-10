import {
  AirtableBaseNameEnum,
  type AirtableRecord,
  type BasicValuesInterface,
} from '@/types'
import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'
import { setApplicationTypesFilter, setAsylumProceduresFilter, setCountriesFilter, setLegalProcedureTypesFilter, setOutcomesFilter } from '@/redux/filtersSlice'
import { useAppDispatch } from './reduxHook'

export const toBasicValues = (records: AirtableRecord[]): BasicValuesInterface[] =>
  records.map((record) => ({
    id: record.id,
    fields: record.fields as BasicValuesInterface['fields'],
  }))


export const useAirtableFilter = () => {
  const airtableService = useAirtableService()
  const dispatch = useAppDispatch()

  const [filterFetched, setFilterFetched] = useState(false)
  const [loadingFilterRecords, setLoadingFilterRecords] = useState(true)
  const [errorFilterRecords, setErrorFilterRecords] = useState<string | null>(null)

  const fetchFilterRecords = useCallback(async () => {
    if (filterFetched) return
    try {
      setLoadingFilterRecords(true)
      setErrorFilterRecords(null)

      const entries = Object.entries(AirtableBaseNameEnum)
      const results = await Promise.all(
        entries.map(async ([key, tableName]) => {
          try {
            const records = await airtableService.fetchRecordsFromTable({
              tableName,
              selectConfig: {
                cellFormat: 'json',
                filterByFormula: 'AND({Count_Caselaws} > 0, {Count_Caselaws} != BLANK())',
                sort: [{ field: 'Count_Caselaws', direction: 'desc' }],
              },
            })
            return { label: tableName, value: records, available: true } 
          } 
          catch {
            return { label: tableName, available: false, value: [] } 
          }
        }),
      )
      // Dispatcher les infos dans le store
  const countriesResult = results.find(r => r.label === AirtableBaseNameEnum.Countries)
  const outcomesResult = results.find(r => r.label === AirtableBaseNameEnum.Outcomes)
  const legalProcedureTypesResult = results.find(r => r.label === AirtableBaseNameEnum.LegalProcedureTypes)
  const applicationTypesResult = results.find(r => r.label === AirtableBaseNameEnum.ApplicationTypes)
  const asylumProceduresResult = results.find(r => r.label === AirtableBaseNameEnum.AsylumProcedures)

    if (countriesResult) dispatch(setCountriesFilter({
      ...countriesResult,
      value: toBasicValues(countriesResult.value),
    }))
    if (outcomesResult) dispatch(setOutcomesFilter({
      ...outcomesResult,
      value: toBasicValues(outcomesResult.value),
    }))
    if (legalProcedureTypesResult) dispatch(setLegalProcedureTypesFilter({
      ...legalProcedureTypesResult,
      value: toBasicValues(legalProcedureTypesResult.value),
    }))
    if (applicationTypesResult) dispatch(setApplicationTypesFilter({
          ...applicationTypesResult,
          value: toBasicValues(applicationTypesResult.value),
        }))
    if (asylumProceduresResult) dispatch(setAsylumProceduresFilter({
          ...asylumProceduresResult,
          value: toBasicValues(asylumProceduresResult.value),
        }))
      setFilterFetched(true)
    }
    catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch filters'
      setErrorFilterRecords(errorMessage)
    }
    finally {
      setLoadingFilterRecords(false)
    }
  }, [airtableService, filterFetched, dispatch])

  useEffect(() => {
    fetchFilterRecords()
  }, [fetchFilterRecords])

  return { loadingFilterRecords, errorFilterRecords, refetchFilterRecords: fetchFilterRecords }
}
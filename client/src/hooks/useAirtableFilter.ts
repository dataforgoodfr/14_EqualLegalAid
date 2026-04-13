import {
  AirtableBaseNameEnum,
  type AirtableRecord,
  type BasicValuesInterface,
} from '@/types'
import { useState, useEffect, useCallback } from 'react'
import { useAirtableService } from '@/providers'
import { setApplicationTypesFilter, setAsylumProceduresFilter, setAuthoritiesFilter, setCountriesFilter, setLegalProcedureTypesFilter, setOutcomesFilter } from '@/redux/filtersSlice'
import { useAppDispatch, useAppSelector } from './reduxHook'
import { useTranslation } from 'react-i18next'

export const toBasicValues = (records: AirtableRecord[]): BasicValuesInterface[] =>
  records.map(record => ({
    id: record.id,
    fields: record.fields as BasicValuesInterface['fields'],
  }))

export const useAirtableFilter = () => {
  const airtableService = useAirtableService()
  const dispatch = useAppDispatch()
  const { i18n } = useTranslation()
  const isGreek = i18n.language === 'el'

  const searchInGivenFilter = useAppSelector(
    state => state.filters.searchInGivenFilter,
  )
  const [filterFetched, setFilterFetched] = useState(false)
  const [loadingFilterRecords, setLoadingFilterRecords] = useState(true)
  const [errorFilterRecords, setErrorFilterRecords] = useState<string | null>(null)
  const [readyToUserSearchInFilter, setReadyToUserSearchInFilter] = useState(false)

  const fetchFilterRecords = useCallback(async () => {
    if (filterFetched) return
    try {
      setLoadingFilterRecords(true)
      setErrorFilterRecords(null)
      const entries: AirtableBaseNameEnum[] = [
        AirtableBaseNameEnum.Countries,
        AirtableBaseNameEnum.Outcomes,
        AirtableBaseNameEnum.LegalProcedureTypes,
        AirtableBaseNameEnum.ApplicationTypes,
        AirtableBaseNameEnum.AsylumProcedures,
        AirtableBaseNameEnum.Authorities,
      ]
      const results = await Promise.all(
        entries.map(async (tableName) => {
          try {
            const records = await airtableService.fetchRecordsFromTable({
              tableName,
              selectConfig: {
                cellFormat: 'json',
                filterByFormula: 'AND({Count_Caselaws} != BLANK(), {Count_Caselaws} > 0)',
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
      const authoritiesResult = results.find(r => r.label === AirtableBaseNameEnum.Authorities)
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
      if (authoritiesResult) dispatch(setAuthoritiesFilter({
        ...authoritiesResult,
        value: toBasicValues(authoritiesResult.value),
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

  const fetchFilterRecordsForSpecificUserSearch = useCallback(async () => {
    const { value, airtableBaseName } = searchInGivenFilter
    const searchField = isGreek ? 'Name_GR' : 'Name_EN'
    const filterByFormula = value.length ? `AND(FIND(LOWER("${value.toLowerCase()}"), LOWER({${searchField}})) > 0, {Count_Caselaws} != BLANK(), {Count_Caselaws} > 0 )` : 'AND({Count_Caselaws} != BLANK(), {Count_Caselaws} > 0)'

    try {
      setLoadingFilterRecords(true)
      setErrorFilterRecords(null)
      const records = await airtableService.fetchRecordsFromTable({
        tableName: airtableBaseName,
        selectConfig: {
          cellFormat: 'json',
          filterByFormula,
          sort: [{ field: 'Count_Caselaws', direction: 'desc' }],
        },
      })

      const formattedFilter = {
        label: airtableBaseName,
        value: toBasicValues(records),
        available: true,
      }

      switch (airtableBaseName) {
        case AirtableBaseNameEnum.Countries:
          dispatch(setCountriesFilter(formattedFilter))
          break
        case AirtableBaseNameEnum.Outcomes:
          dispatch(setOutcomesFilter(formattedFilter))
          break
        case AirtableBaseNameEnum.LegalProcedureTypes:
          dispatch(setLegalProcedureTypesFilter(formattedFilter))
          break
        case AirtableBaseNameEnum.ApplicationTypes:
          dispatch(setApplicationTypesFilter(formattedFilter))
          break
        case AirtableBaseNameEnum.AsylumProcedures:
          dispatch(setAsylumProceduresFilter(formattedFilter))
          break
        case AirtableBaseNameEnum.Authorities:
          dispatch(setAuthoritiesFilter(formattedFilter))
          break
      }
    }
    catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch specific filter'
      setErrorFilterRecords(errorMessage)
    }
    finally {
      setLoadingFilterRecords(false)
    }
  }, [airtableService, dispatch, searchInGivenFilter, isGreek])

  useEffect(() => {
    fetchFilterRecords()
  }, [fetchFilterRecords])

  useEffect(() => {
    if (!readyToUserSearchInFilter) {
      setReadyToUserSearchInFilter(true)
      return
    }
    fetchFilterRecordsForSpecificUserSearch()
  }, [fetchFilterRecordsForSpecificUserSearch, searchInGivenFilter, readyToUserSearchInFilter])

  return { loadingFilterRecords, errorFilterRecords, refetchFilterRecords: fetchFilterRecords }
}

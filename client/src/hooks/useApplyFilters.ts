import { useCallback } from 'react'
import { useAppSelector } from '@/hooks/reduxHook'
import { AirtableBaseNameEnum, type DatePartSelection } from '@/types'

export interface FacetSelectedFilters {
  [AirtableBaseNameEnum.Countries]: string[]
  [AirtableBaseNameEnum.Outcomes]: string[]
  [AirtableBaseNameEnum.LegalProcedureTypes]: string[]
  [AirtableBaseNameEnum.ApplicationTypes]: string[]
  [AirtableBaseNameEnum.AsylumProcedures]: string[]
  [AirtableBaseNameEnum.Authorities]: string[]
}

export interface SelectedFilters extends FacetSelectedFilters {
  startDate: string | null
  endDate: string | null
}

const getFilterValue = (
  filterName: AirtableBaseNameEnum,
  value: { fields: { Name_EN: string, Name_Long_EN?: string } },
): string => {
  if (filterName === AirtableBaseNameEnum.Authorities) {
    return value.fields.Name_Long_EN ?? value.fields.Name_EN
  }

  return value.fields.Name_EN
}

const isCompleteDateSelection = (selection: DatePartSelection): boolean => {
  return selection.month !== null && selection.year !== null
}

const toDateValue = (
  selection: DatePartSelection,
  boundary: 'start' | 'end',
): string | null => {
  if (!isCompleteDateSelection(selection)) {
    return null
  }

  const monthIndex = selection.month as number
  const year = selection.year as number

  const date = boundary === 'start'
    ? new Date(Date.UTC(year, monthIndex, 1))
    : new Date(Date.UTC(year, monthIndex + 1, 0))

  return date.toISOString().slice(0, 10)
}

const getNamesByIds = (
  filterName: AirtableBaseNameEnum,
  ids: string[],
  values: { id: string, fields: { Name_EN: string, Name_Long_EN?: string } }[],
): string[] => values.filter(item => ids.includes(item.id)).map(item => getFilterValue(filterName, item))

export const useApplyFilters = () => {
  const countries = useAppSelector(state => state.filters.countries)
  const outcomes = useAppSelector(state => state.filters.outcomes)
  const legalProcedureTypes = useAppSelector(state => state.filters.legalProcedureTypes)
  const applicationTypes = useAppSelector(state => state.filters.applicationTypes)
  const asylumProcedures = useAppSelector(state => state.filters.asylumProcedures)
  const authorities = useAppSelector(state => state.filters.authorities)

  const countriesSelected = useAppSelector(state => state.filters.countriesSelected)
  const outcomesSelected = useAppSelector(state => state.filters.outcomesSelected)
  const legalProcedureTypesSelected = useAppSelector(state => state.filters.legalProcedureTypesSelected)
  const applicationTypesSelected = useAppSelector(state => state.filters.applicationTypesSelected)
  const asylumProceduresSelected = useAppSelector(state => state.filters.asylumProceduresSelected)
  const authoritiesSelected = useAppSelector(state => state.filters.authoritiesSelected)

  const dateStart = useAppSelector(state => state.filters.dateStart)
  const dateEnd = useAppSelector(state => state.filters.dateEnd)

  const hasActiveFilters
    = countriesSelected.length > 0
    || outcomesSelected.length > 0
    || legalProcedureTypesSelected.length > 0
    || applicationTypesSelected.length > 0
    || asylumProceduresSelected.length > 0
    || authoritiesSelected.length > 0
    || isCompleteDateSelection(dateStart)
    || isCompleteDateSelection(dateEnd)

  const getSelectedFilters = useCallback((): SelectedFilters => ({
    [AirtableBaseNameEnum.Countries]: getNamesByIds(AirtableBaseNameEnum.Countries, countriesSelected, countries.value),
    [AirtableBaseNameEnum.Outcomes]: getNamesByIds(AirtableBaseNameEnum.Outcomes, outcomesSelected, outcomes.value),
    [AirtableBaseNameEnum.LegalProcedureTypes]: getNamesByIds(AirtableBaseNameEnum.LegalProcedureTypes, legalProcedureTypesSelected, legalProcedureTypes.value),
    [AirtableBaseNameEnum.ApplicationTypes]: getNamesByIds(AirtableBaseNameEnum.ApplicationTypes, applicationTypesSelected, applicationTypes.value),
    [AirtableBaseNameEnum.AsylumProcedures]: getNamesByIds(AirtableBaseNameEnum.AsylumProcedures, asylumProceduresSelected, asylumProcedures.value),
    [AirtableBaseNameEnum.Authorities]: getNamesByIds(AirtableBaseNameEnum.Authorities, authoritiesSelected, authorities.value),
    startDate: toDateValue(dateStart, 'start'),
    endDate: toDateValue(dateEnd, 'end'),
  }), [
    countriesSelected,
    countries.value,
    outcomesSelected,
    outcomes.value,
    legalProcedureTypesSelected,
    legalProcedureTypes.value,
    applicationTypesSelected,
    applicationTypes.value,
    asylumProceduresSelected,
    asylumProcedures.value,
    authoritiesSelected,
    authorities.value,
    dateStart,
    dateEnd,
  ])

  return { getSelectedFilters, hasActiveFilters }
}

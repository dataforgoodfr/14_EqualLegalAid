import { useCallback } from 'react'
import { useAppSelector } from '@/hooks/reduxHook'
import { AirtableBaseNameEnum, type DatePartSelection } from '@/types'

export interface FacetSelectedFilters {
  [AirtableBaseNameEnum.Countries]: string[]
  [AirtableBaseNameEnum.Outcomes]: string[]
  [AirtableBaseNameEnum.LegalProcedureTypes]: string[]
  [AirtableBaseNameEnum.ApplicationTypes]: string[]
  [AirtableBaseNameEnum.AsylumProcedures]: string[]
}

export interface SelectedFilters extends FacetSelectedFilters {
  startDate: string | null
  endDate: string | null
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
  ids: string[],
  values: { id: string, fields: { Name_EN: string } }[],
): string[] => values.filter(item => ids.includes(item.id)).map(item => item.fields.Name_EN)

export const useApplyFilters = () => {
  const countries = useAppSelector(state => state.filters.countries)
  const outcomes = useAppSelector(state => state.filters.outcomes)
  const legalProcedureTypes = useAppSelector(state => state.filters.legalProcedureTypes)
  const applicationTypes = useAppSelector(state => state.filters.applicationTypes)
  const asylumProcedures = useAppSelector(state => state.filters.asylumProcedures)

  const countriesSelected = useAppSelector(state => state.filters.countriesSelected)
  const outcomesSelected = useAppSelector(state => state.filters.outcomesSelected)
  const legalProcedureTypesSelected = useAppSelector(state => state.filters.legalProcedureTypesSelected)
  const applicationTypesSelected = useAppSelector(state => state.filters.applicationTypesSelected)
  const asylumProceduresSelected = useAppSelector(state => state.filters.asylumProceduresSelected)
  const dateStart = useAppSelector(state => state.filters.dateStart)
  const dateEnd = useAppSelector(state => state.filters.dateEnd)

  const hasActiveFilters
    = countriesSelected.length > 0
    || outcomesSelected.length > 0
    || legalProcedureTypesSelected.length > 0
    || applicationTypesSelected.length > 0
    || asylumProceduresSelected.length > 0
    || isCompleteDateSelection(dateStart)
    || isCompleteDateSelection(dateEnd)

  const getSelectedFilters = useCallback((): SelectedFilters => ({
    [AirtableBaseNameEnum.Countries]: getNamesByIds(countriesSelected, countries.value),
    [AirtableBaseNameEnum.Outcomes]: getNamesByIds(outcomesSelected, outcomes.value),
    [AirtableBaseNameEnum.LegalProcedureTypes]: getNamesByIds(legalProcedureTypesSelected, legalProcedureTypes.value),
    [AirtableBaseNameEnum.ApplicationTypes]: getNamesByIds(applicationTypesSelected, applicationTypes.value),
    [AirtableBaseNameEnum.AsylumProcedures]: getNamesByIds(asylumProceduresSelected, asylumProcedures.value),
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
    dateStart,
    dateEnd,
  ])

  return { getSelectedFilters, hasActiveFilters }
}

import { useAppSelector } from '@/hooks/reduxHook'
import { AirtableBaseNameEnum } from '@/types'

export interface SelectedFilters {
  [AirtableBaseNameEnum.Countries]: string[]
  [AirtableBaseNameEnum.Outcomes]: string[]
  [AirtableBaseNameEnum.LegalProcedureTypes]: string[]
  [AirtableBaseNameEnum.ApplicationTypes]: string[]
  [AirtableBaseNameEnum.AsylumProcedures]: string[]
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

  const hasActiveFilters
    = countriesSelected.length > 0
      || outcomesSelected.length > 0
      || legalProcedureTypesSelected.length > 0
      || applicationTypesSelected.length > 0
      || asylumProceduresSelected.length > 0

  const getSelectedFilters = (): SelectedFilters => ({
    [AirtableBaseNameEnum.Countries]: getNamesByIds(countriesSelected, countries.value),
    [AirtableBaseNameEnum.Outcomes]: getNamesByIds(outcomesSelected, outcomes.value),
    [AirtableBaseNameEnum.LegalProcedureTypes]: getNamesByIds(legalProcedureTypesSelected, legalProcedureTypes.value),
    [AirtableBaseNameEnum.ApplicationTypes]: getNamesByIds(applicationTypesSelected, applicationTypes.value),
    [AirtableBaseNameEnum.AsylumProcedures]: getNamesByIds(asylumProceduresSelected, asylumProcedures.value),
  })

  return { getSelectedFilters, hasActiveFilters }
}

import { useCallback } from 'react'
import { useAppSelector } from '@/hooks/reduxHook'
import { useTranslation } from 'react-i18next'
import { AirtableBaseNameEnum, type DatePartSelection } from '@/types'

export interface FacetSelectedFilters {
  [AirtableBaseNameEnum.Countries]: string[]
  [AirtableBaseNameEnum.Outcomes]: string[]
  [AirtableBaseNameEnum.LegalProcedureTypes]: string[]
  [AirtableBaseNameEnum.ApplicationTypes]: string[]
  [AirtableBaseNameEnum.AsylumProcedures]: string[]
  [AirtableBaseNameEnum.Authorities]: string[]
  [AirtableBaseNameEnum.Keywords]: string[]
  [AirtableBaseNameEnum.Vulnerability]: string[]
  [AirtableBaseNameEnum.GroundOfPersecution]: string[]
  [AirtableBaseNameEnum.LegalAndProceduralIssues]: string[]
  [AirtableBaseNameEnum.HouseholdIndividualStatus]: string[]
}

export interface SelectedFilters extends FacetSelectedFilters {
  startDate: string | null
  endDate: string | null
}

const getStringField = (fields: Record<string, unknown>, key: string) => {
  const value = fields[key]
  return typeof value === 'string' ? value : ''
}

const getFilterValue = (
  filterName: AirtableBaseNameEnum,
  value: { fields: Record<string, unknown> },
  isGreek: boolean,
): string => {
  switch (filterName) {
    case AirtableBaseNameEnum.Authorities: {
      const nameLongEn = getStringField(value.fields, 'Name_Long_EN')
      const nameLongGr = getStringField(value.fields, 'Name_Long_GR')
      const nameEn = getStringField(value.fields, 'Name_EN')
      const nameGr = getStringField(value.fields, 'Name_GR')
      return isGreek
        ? nameLongGr || nameGr || nameLongEn || nameEn
        : nameLongEn || nameEn
    }
    case AirtableBaseNameEnum.Keywords: {
      const keywordEn = getStringField(value.fields, 'Keyword_EN')
      return keywordEn
    }
    default: {
      const nameEn = getStringField(value.fields, 'Name_EN')
      const nameGr = getStringField(value.fields, 'Name_GR')
      return isGreek ? nameGr || nameEn : nameEn
    }
  }
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
  values: Array<{ id: string, fields: Record<string, unknown> }>,
  isGreek: boolean,
): string[] => values
  .filter(item => ids.includes(item.id))
  .map(item => getFilterValue(filterName, item, isGreek))

export const useApplyFilters = () => {
  const { i18n } = useTranslation()
  const isGreek = i18n.language === 'el'

  const countries = useAppSelector(state => state.filters.countries)
  const outcomes = useAppSelector(state => state.filters.outcomes)
  const legalProcedureTypes = useAppSelector(state => state.filters.legalProcedureTypes)
  const applicationTypes = useAppSelector(state => state.filters.applicationTypes)
  const asylumProcedures = useAppSelector(state => state.filters.asylumProcedures)
  const authorities = useAppSelector(state => state.filters.authorities)
  const keywords = useAppSelector(state => state.filters.keywords)

  const countriesSelected = useAppSelector(state => state.filters.countriesSelected)
  const outcomesSelected = useAppSelector(state => state.filters.outcomesSelected)
  const legalProcedureTypesSelected = useAppSelector(state => state.filters.legalProcedureTypesSelected)
  const applicationTypesSelected = useAppSelector(state => state.filters.applicationTypesSelected)
  const asylumProceduresSelected = useAppSelector(state => state.filters.asylumProceduresSelected)
  const authoritiesSelected = useAppSelector(state => state.filters.authoritiesSelected)
  const keywordsSelected = useAppSelector(state => state.filters.keywordsSelected)
  const vulnerabilitySelected = useAppSelector(state => state.filters.vulnerabilitySelected)
  const groundOfPersecutionSelected = useAppSelector(state => state.filters.groundOfPersecutionSelected)
  const legalAndProceduralIssuesSelected = useAppSelector(state => state.filters.legalAndProceduralIssuesSelected)
  const householdIndividualStatusSelected = useAppSelector(state => state.filters.householdIndividualStatusSelected)

  const dateStart = useAppSelector(state => state.filters.dateStart)
  const dateEnd = useAppSelector(state => state.filters.dateEnd)

  const hasActiveFilters
    = countriesSelected.length > 0
    || outcomesSelected.length > 0
    || legalProcedureTypesSelected.length > 0
    || applicationTypesSelected.length > 0
    || asylumProceduresSelected.length > 0
    || authoritiesSelected.length > 0
    || keywordsSelected.length > 0
    || vulnerabilitySelected.length > 0
    || groundOfPersecutionSelected.length > 0
    || legalAndProceduralIssuesSelected.length > 0
    || householdIndividualStatusSelected.length > 0
    || isCompleteDateSelection(dateStart)
    || isCompleteDateSelection(dateEnd)

  const getSelectedFilters = useCallback((): SelectedFilters => ({
    [AirtableBaseNameEnum.Countries]: getNamesByIds(AirtableBaseNameEnum.Countries, countriesSelected, countries.value, isGreek),
    [AirtableBaseNameEnum.Outcomes]: getNamesByIds(AirtableBaseNameEnum.Outcomes, outcomesSelected, outcomes.value, isGreek),
    [AirtableBaseNameEnum.LegalProcedureTypes]: getNamesByIds(AirtableBaseNameEnum.LegalProcedureTypes, legalProcedureTypesSelected, legalProcedureTypes.value, isGreek),
    [AirtableBaseNameEnum.ApplicationTypes]: getNamesByIds(AirtableBaseNameEnum.ApplicationTypes, applicationTypesSelected, applicationTypes.value, isGreek),
    [AirtableBaseNameEnum.AsylumProcedures]: getNamesByIds(AirtableBaseNameEnum.AsylumProcedures, asylumProceduresSelected, asylumProcedures.value, isGreek),
    [AirtableBaseNameEnum.Authorities]: getNamesByIds(AirtableBaseNameEnum.Authorities, authoritiesSelected, authorities.value, isGreek),
    [AirtableBaseNameEnum.Keywords]: getNamesByIds(AirtableBaseNameEnum.Keywords, keywordsSelected, keywords.value, isGreek),
    [AirtableBaseNameEnum.Vulnerability]: getNamesByIds(AirtableBaseNameEnum.Keywords, vulnerabilitySelected, keywords.value, isGreek),
    [AirtableBaseNameEnum.GroundOfPersecution]: getNamesByIds(AirtableBaseNameEnum.Keywords, groundOfPersecutionSelected, keywords.value, isGreek),
    [AirtableBaseNameEnum.LegalAndProceduralIssues]: getNamesByIds(AirtableBaseNameEnum.Keywords, legalAndProceduralIssuesSelected, keywords.value, isGreek),
    [AirtableBaseNameEnum.HouseholdIndividualStatus]: getNamesByIds(AirtableBaseNameEnum.Keywords, householdIndividualStatusSelected, keywords.value, isGreek),
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
    keywordsSelected,
    keywords.value,
    vulnerabilitySelected,
    groundOfPersecutionSelected,
    legalAndProceduralIssuesSelected,
    householdIndividualStatusSelected,
    dateStart,
    dateEnd,
    isGreek,
  ])

  return { getSelectedFilters, hasActiveFilters }
}

import { useAppSelector } from '@/hooks/reduxHook'

/*
  Ce hook lit les filtres sélectionnés dans Redux et calcule la liste dédupliquée
  des IDs de caselaws correspondants, en croisant avec les values de chaque filtre.
*/
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

  const hasActiveFilters =
    countriesSelected.length > 0 ||
    outcomesSelected.length > 0 ||
    legalProcedureTypesSelected.length > 0

  const getSelectedCaselawIds = (): string[] => {
    const groups = [
      { selected: countriesSelected, filterValues: countries.value },
      { selected: outcomesSelected, filterValues: outcomes.value },
      { selected: legalProcedureTypesSelected, filterValues: legalProcedureTypes.value },
      { selected: applicationTypesSelected, filterValues: applicationTypes.value },
      { selected: asylumProceduresSelected, filterValues: asylumProcedures.value },
    ]

    const caselawIds = groups.flatMap(({ selected, filterValues }) =>
      filterValues
        .filter(item => selected.includes(item.id))
        .flatMap(item => item.fields.Caselaws),
    )

    // Déduplique les ids
    return [...new Set(caselawIds)]
  }

  return { getSelectedCaselawIds, hasActiveFilters }
}

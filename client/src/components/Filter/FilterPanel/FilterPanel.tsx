import {
  AirtableBaseNameEnum,
  FilterTypeEnum,
  type BasicValuesInterface,
  type FilterInterface,
} from '@/types/index'
import { setSearchInGivenFilter } from '@/redux/filtersSlice'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
} from '@/components/ui'
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHook'
import {
  BasicFilterItem,
  ACCORDION_CONFIG,
  TOGGLE_ACTION_MAP,
} from '@/components/Filter'
import { useApplyFilters, type SelectedFilters } from '@/hooks/useApplyFilters'
import { useState } from 'react'

export interface AccordionInterface {
  accordionTriggerLabel: string
  airtableBaseName: AirtableBaseNameEnum
  filterType: FilterTypeEnum
  search: {
    enabled: boolean
    placeholder: string
  }
}

export interface AccordionItemInterface extends AccordionInterface {
  items: BasicValuesInterface[] | []
  available: boolean
}

interface FilterPanelProps {
  onApplyFilters: (selectedFilters: SelectedFilters) => void
}

const createAccordionItems = (filterRecords: FilterInterface[]): AccordionItemInterface[] => {
  return ACCORDION_CONFIG.map((accordionConfigItem) => {
    const matchedFilter = filterRecords.find(filter => filter.label === accordionConfigItem.airtableBaseName)
    return {
      ...accordionConfigItem,
      items: matchedFilter?.value ?? [],
      available: matchedFilter?.available ?? false,
    }
  })
}

export const FilterPanel = ({ onApplyFilters }: FilterPanelProps) => {
  const dispatch = useAppDispatch()
  const { getSelectedFilters, hasActiveFilters } = useApplyFilters()

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
  const [filterSearchValue, setFilerSearchValue] = useState('')
  const SELECTED_IDS_MAP: Partial<Record<AirtableBaseNameEnum, string[]>> = {
    [AirtableBaseNameEnum.Countries]: countriesSelected,
    [AirtableBaseNameEnum.Outcomes]: outcomesSelected,
    [AirtableBaseNameEnum.LegalProcedureTypes]: legalProcedureTypesSelected,
    [AirtableBaseNameEnum.ApplicationTypes]: applicationTypesSelected,
    [AirtableBaseNameEnum.AsylumProcedures]: asylumProceduresSelected,
  }

  const accordionItems = createAccordionItems([countries, outcomes, legalProcedureTypes, applicationTypes, asylumProcedures])

  const handleFilterChange = (
    airtableBaseName: AirtableBaseNameEnum,
    id: string,
    checked: boolean,
  ) => {
    const action = TOGGLE_ACTION_MAP[airtableBaseName]
    if (action) {
      dispatch(action({ id, checked }))
    }
  }

  const handleApplyFilters = () => {
    if (!hasActiveFilters) return
    onApplyFilters(getSelectedFilters())
  }
  const handleFilterSearch = (airtableBaseName: AirtableBaseNameEnum, value: string) => {
    const filterSearchKey = `${airtableBaseName}-${value}`
    if (filterSearchValue === filterSearchKey) {
      return
    }
    setFilerSearchValue(filterSearchKey)
    dispatch(setSearchInGivenFilter({
      airtableBaseName,
      value,
    }))
  }

  return (
    <>
      <Accordion type="multiple">
        {accordionItems.map((accordionItem, accordionItemIndex) => {
          if (accordionItem.filterType === FilterTypeEnum.Basic && accordionItem.available) {
            return (
              <AccordionItem value={`item-${accordionItemIndex}`} key={accordionItemIndex}>
                <AccordionTrigger>{accordionItem.accordionTriggerLabel}</AccordionTrigger>
                <AccordionContent>
                  <BasicFilterItem
                    enabledSearch={accordionItem.search.enabled}
                    searchPlaceholder={accordionItem.search.placeholder}
                    items={accordionItem.items}
                    selectedIds={SELECTED_IDS_MAP[accordionItem.airtableBaseName] ?? []}
                    onFilterChange={(id, checked) => handleFilterChange(accordionItem.airtableBaseName, id, checked)}
                    onSearchChange={value => handleFilterSearch(accordionItem.airtableBaseName, value as string)}
                  />
                </AccordionContent>
              </AccordionItem>
            )
          }
        })}
      </Accordion>
      <Button
        onClick={handleApplyFilters}
        disabled={!hasActiveFilters}
      >
        Filtrer
      </Button>
    </>
  )
}

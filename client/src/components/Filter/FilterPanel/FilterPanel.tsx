import { useEffect, useRef } from 'react'
import {
  AirtableBaseNameEnum,
  FilterTypeEnum,
  type BasicValuesInterface,
  type FilterInterface,
} from '@/types/index'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui'
import { useAppSelector, useAppDispatch } from '@/hooks/reduxHook'
import {
  BasicFilterItem,
  ACCORDION_CONFIG,
  DateFilterItem,
  TOGGLE_ACTION_MAP,
  GroupedFilterItem,
} from '@/components/Filter'
import { useApplyFilters, type SelectedFilters } from '@/hooks/useApplyFilters'
import { useTranslation } from 'react-i18next'
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
  minDate: Date | null
  maxDate: Date | null
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

export const FilterPanel = ({ onApplyFilters, minDate, maxDate }: FilterPanelProps) => {
  const dispatch = useAppDispatch()
  const { getSelectedFilters } = useApplyFilters()
  const isMounted = useRef(false)
  const { t } = useTranslation()

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

  const SELECTED_IDS_MAP: Partial<Record<AirtableBaseNameEnum, string[]>> = {
    [AirtableBaseNameEnum.Countries]: countriesSelected,
    [AirtableBaseNameEnum.Outcomes]: outcomesSelected,
    [AirtableBaseNameEnum.LegalProcedureTypes]: legalProcedureTypesSelected,
    [AirtableBaseNameEnum.ApplicationTypes]: applicationTypesSelected,
    [AirtableBaseNameEnum.AsylumProcedures]: asylumProceduresSelected,
    [AirtableBaseNameEnum.Authorities]: authoritiesSelected,
  }

  const accordionItems = createAccordionItems([countries, outcomes, legalProcedureTypes, applicationTypes, asylumProcedures, authorities])

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    onApplyFilters(getSelectedFilters())
  }, [
    getSelectedFilters,
    onApplyFilters,
    countriesSelected,
    outcomesSelected,
    legalProcedureTypesSelected,
    applicationTypesSelected,
    asylumProceduresSelected,
    authoritiesSelected,
    dateStart,
    dateEnd,
  ])

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
  return (
    <Accordion type="multiple">
      {accordionItems.map((accordionItem, accordionItemIndex) => {
        if (accordionItem.filterType === FilterTypeEnum.Basic && accordionItem.available) {
          return (
            <AccordionItem value={`item-${accordionItemIndex}`} key={accordionItemIndex}>
              <AccordionTrigger>{t(accordionItem.accordionTriggerLabel)}</AccordionTrigger>
              <AccordionContent>
                <BasicFilterItem
                  enabledSearch={accordionItem.search.enabled}
                  searchPlaceholder={t(accordionItem.search.placeholder)}
                  items={accordionItem.items}
                  airtableBaseName={accordionItem.airtableBaseName}
                  selectedIds={SELECTED_IDS_MAP[accordionItem.airtableBaseName] ?? []}
                  onFilterChange={(id, checked) => handleFilterChange(accordionItem.airtableBaseName, id, checked)}
                />
              </AccordionContent>
            </AccordionItem>
          )
        }

        if (accordionItem.filterType === FilterTypeEnum.NameToSplit && accordionItem.available) {
          return (
            <AccordionItem value={`item-${accordionItemIndex}`} key={accordionItemIndex}>
              <AccordionTrigger>{t(accordionItem.accordionTriggerLabel)}</AccordionTrigger>
              <AccordionContent>
                <GroupedFilterItem
                  items={accordionItem.items}
                  airtableBaseName={accordionItem.airtableBaseName}
                  selectedIds={SELECTED_IDS_MAP[accordionItem.airtableBaseName] ?? []}
                  onFilterChange={(id, checked) => handleFilterChange(accordionItem.airtableBaseName, id, checked)}
                />
              </AccordionContent>
            </AccordionItem>
          )
        }
      })}
      <AccordionItem value="item-date">
        <AccordionTrigger>{t('filter.decisionDate')}</AccordionTrigger>
        <AccordionContent>
          <DateFilterItem
            minDate={minDate}
            maxDate={maxDate}
            startDate={dateStart}
            endDate={dateEnd}
          />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

import { useEffect, useRef, useState } from 'react'
import {
  AirtableBaseNameEnum,
  FilterTypeEnum,
  type AirtableRecord,
  type BasicValuesInterface,
  type FilterInterface,
} from '@/types/index'
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
  CategoriesFilterItem,
  DateFilterItem,
  TOGGLE_ACTION_MAP,
  GroupedFilterItem,
  FilterItemWrapper,
} from '@/components/Filter'
import { useApplyFilters, type SelectedFilters } from '@/hooks/useApplyFilters'
import { useTranslation } from 'react-i18next'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { resetAllSelected } from '@/redux/filtersSlice'
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
  items: BasicValuesInterface[] | AirtableRecord[] | []
  available: boolean
}

interface FilterPanelProps {
  onApplyFilters: (selectedFilters: SelectedFilters) => void
  count: number
  minDate: Date | null
  maxDate: Date | null
}

const createAccordionItems = (
  filterRecords: FilterInterface<BasicValuesInterface | AirtableRecord>[],
): AccordionItemInterface[] => {
  return ACCORDION_CONFIG.map((accordionConfigItem) => {
    const matchedFilter = filterRecords.find(filter => filter.label === accordionConfigItem.airtableBaseName)
    return {
      ...accordionConfigItem,
      items: matchedFilter?.value ?? [],
      available: matchedFilter?.available ?? false,
    }
  })
}

export const FilterPanel = ({ onApplyFilters, minDate, maxDate, count }: FilterPanelProps) => {
  const [displayFilterPanel, setDisplayFilterPanel] = useState(false)
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
  const categories = useAppSelector(state => state.filters.categories)
  const subCategories = useAppSelector(state => state.filters.subCategories)
  const keywords = useAppSelector(state => state.filters.keywords)

  const countriesSelected = useAppSelector(state => state.filters.countriesSelected)
  const outcomesSelected = useAppSelector(state => state.filters.outcomesSelected)
  const legalProcedureTypesSelected = useAppSelector(state => state.filters.legalProcedureTypesSelected)
  const applicationTypesSelected = useAppSelector(state => state.filters.applicationTypesSelected)
  const asylumProceduresSelected = useAppSelector(state => state.filters.asylumProceduresSelected)
  const authoritiesSelected = useAppSelector(state => state.filters.authoritiesSelected)
  const keywordsSelected = useAppSelector(state => state.filters.keywordsSelected)

  const dateStart = useAppSelector(state => state.filters.dateStart)
  const dateEnd = useAppSelector(state => state.filters.dateEnd)

  const filterTags = useAppSelector(state => state.filters.filterTags)

  const SELECTED_IDS_MAP: Partial<Record<AirtableBaseNameEnum, string[]>> = {
    [AirtableBaseNameEnum.Countries]: countriesSelected,
    [AirtableBaseNameEnum.Outcomes]: outcomesSelected,
    [AirtableBaseNameEnum.LegalProcedureTypes]: legalProcedureTypesSelected,
    [AirtableBaseNameEnum.ApplicationTypes]: applicationTypesSelected,
    [AirtableBaseNameEnum.AsylumProcedures]: asylumProceduresSelected,
    [AirtableBaseNameEnum.Authorities]: authoritiesSelected,
  }

  const accordionItems = createAccordionItems([countries, outcomes, legalProcedureTypes, applicationTypes, asylumProcedures, categories, authorities])

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
    keywordsSelected,
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
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([])
  return (
    <>
      <p className="text-gray-count text-xl font-semibold xl:hidden">
        <span className="mr-2 font-bold text-black">{count}</span>
        {t('filter.decisions', { count })}
      </p>
      <Button
        variant="outline"
        className="mt-4 mb-6 w-full xl:hidden"
        onClick={() => setDisplayFilterPanel(true)}
      >
        {t('filter.controls.toggle')}
      </Button>
      <button
        className={cn(
          'text-blue-france mb-8 cursor-pointer items-center text-[13px] font-medium hidden',
          { 'xl:flex': filterTags.length },
        )}
        onClick={() => dispatch(resetAllSelected())}
      >
        <RefreshCw
          className="mr-2"
          size={16}
        />
        {t('filter.controls.clear')}
      </button>
      <FilterItemWrapper
        count={count}
        FilterItemWrapperBackButtonLabel={t('filter.controls.label')}
        setCloseAllPanel={() => setDisplayFilterPanel(false)}
        setClosePanel={() => setDisplayFilterPanel(false)}
        showFilterItemWrapper={displayFilterPanel}
      >
        <Accordion
          type="multiple"
          value={openAccordionItems}
          onValueChange={setOpenAccordionItems}
        >
          {accordionItems.map((accordionItem, accordionItemIndex) => {
            const itemValue = `item-${accordionItemIndex}`

            if (accordionItem.filterType === FilterTypeEnum.Basic && accordionItem.available) {
              return (
                <AccordionItem
                  value={`item-${accordionItemIndex}`}
                  key={accordionItemIndex}
                >
                  <AccordionTrigger>{t(accordionItem.accordionTriggerLabel)}</AccordionTrigger>
                  <AccordionContent>
                    <FilterItemWrapper
                      FilterItemWrapperBackButtonLabel={t(accordionItem.accordionTriggerLabel)}
                      showFilterItemWrapper={openAccordionItems.includes(itemValue)}
                      setClosePanel={
                        () => setOpenAccordionItems(prev => prev.filter(value => value !== itemValue))
                      }
                      setCloseAllPanel={() => setDisplayFilterPanel(false)}
                      count={count}
                    >
                      <BasicFilterItem
                        enabledSearch={accordionItem.search.enabled}
                        searchPlaceholder={t(accordionItem.search.placeholder)}
                        items={accordionItem.items as BasicValuesInterface[]}
                        airtableBaseName={accordionItem.airtableBaseName}
                        selectedIds={SELECTED_IDS_MAP[accordionItem.airtableBaseName] ?? []}
                        onFilterChange={(id, checked) => handleFilterChange(accordionItem.airtableBaseName, id, checked)}
                        displayResultNumber={accordionItem.airtableBaseName === 'Countries'}
                      />
                    </FilterItemWrapper>
                  </AccordionContent>
                </AccordionItem>
              )
            }

            if (accordionItem.filterType === FilterTypeEnum.Hierarchical && accordionItem.available) {
              return (
                <AccordionItem value={`item-${accordionItemIndex}`} key={accordionItemIndex}>
                  <AccordionTrigger>{t(accordionItem.accordionTriggerLabel)}</AccordionTrigger>
                  <AccordionContent>
                    <CategoriesFilterItem
                      categories={categories.value}
                      subCategories={subCategories.value}
                      keywords={keywords.value}
                      selectedKeywordIds={keywordsSelected}
                    />
                  </AccordionContent>
                </AccordionItem>
              )
            }

            if (accordionItem.filterType === FilterTypeEnum.NameToSplit && accordionItem.available) {
              return (
                <AccordionItem
                  value={`item-${accordionItemIndex}`}
                  key={accordionItemIndex}
                >
                  <AccordionTrigger>{t(accordionItem.accordionTriggerLabel)}</AccordionTrigger>
                  <AccordionContent>
                    <FilterItemWrapper
                      FilterItemWrapperBackButtonLabel={t(accordionItem.accordionTriggerLabel)}
                      showFilterItemWrapper={openAccordionItems.includes(itemValue)}
                      setClosePanel={
                        () => setOpenAccordionItems(prev => prev.filter(value => value !== itemValue))
                      }
                      setCloseAllPanel={() => setDisplayFilterPanel(false)}
                      count={count}
                    >
                      <GroupedFilterItem
                        items={accordionItem.items as BasicValuesInterface[]}
                        airtableBaseName={accordionItem.airtableBaseName}
                        selectedIds={SELECTED_IDS_MAP[accordionItem.airtableBaseName] ?? []}
                        onFilterChange={(id, checked) => handleFilterChange(accordionItem.airtableBaseName, id, checked)}
                      />
                    </FilterItemWrapper>
                  </AccordionContent>
                </AccordionItem>
              )
            }
          })}
          <AccordionItem value="item-date">
            <AccordionTrigger>{t('filter.decisionDate')}</AccordionTrigger>
            <AccordionContent>
              <FilterItemWrapper
                FilterItemWrapperBackButtonLabel={t('filter.decisionDate')}
                showFilterItemWrapper={openAccordionItems.includes('item-date')}
                setClosePanel={
                  () => setOpenAccordionItems(prev => prev.filter(value => value !== 'item-date'))
                }
                setCloseAllPanel={() => setDisplayFilterPanel(false)}
                count={count}
              >
                <DateFilterItem
                  minDate={minDate}
                  maxDate={maxDate}
                  startDate={dateStart}
                  endDate={dateEnd}
                />
              </FilterItemWrapper>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </FilterItemWrapper>

    </>
  )
}

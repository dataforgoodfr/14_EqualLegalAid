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

const toIdArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }

  if (typeof value === 'string') {
    return value.split(',').map(item => item.trim()).filter(Boolean)
  }

  return []
}

const getFieldValue = (record: AirtableRecord, key: string): unknown => {
  const fieldKey = Object.keys(record.fields).find(fieldName => fieldName.toLowerCase() === key.toLowerCase())
  return fieldKey ? record.fields[fieldKey] : undefined
}
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
  const vulnerability = useAppSelector(state => state.filters.vulnerability)
  const groundOfPersecution = useAppSelector(state => state.filters.groundOfPersecution)
  const legalAndProceduralIssues = useAppSelector(state => state.filters.legalAndProceduralIssues)
  const householdIndividualStatus = useAppSelector(state => state.filters.householdIndividualStatus)
  const subCategories = useAppSelector(state => state.filters.subCategories)
  const keywords = useAppSelector(state => state.filters.keywords)

  const countriesSelected = useAppSelector(state => state.filters.countriesSelected)
  const outcomesSelected = useAppSelector(state => state.filters.outcomesSelected)
  const legalProcedureTypesSelected = useAppSelector(state => state.filters.legalProcedureTypesSelected)
  const applicationTypesSelected = useAppSelector(state => state.filters.applicationTypesSelected)
  const asylumProceduresSelected = useAppSelector(state => state.filters.asylumProceduresSelected)
  const authoritiesSelected = useAppSelector(state => state.filters.authoritiesSelected)
  const vulnerabilitySelected = useAppSelector(state => state.filters.vulnerabilitySelected)
  const groundOfPersecutionSelected = useAppSelector(state => state.filters.groundOfPersecutionSelected)
  const legalAndProceduralIssuesSelected = useAppSelector(state => state.filters.legalAndProceduralIssuesSelected)
  const householdIndividualStatusSelected = useAppSelector(state => state.filters.householdIndividualStatusSelected)
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
    [AirtableBaseNameEnum.Vulnerability]: vulnerabilitySelected,
    [AirtableBaseNameEnum.GroundOfPersecution]: groundOfPersecutionSelected,
    [AirtableBaseNameEnum.LegalAndProceduralIssues]: legalAndProceduralIssuesSelected,
    [AirtableBaseNameEnum.HouseholdIndividualStatus]: householdIndividualStatusSelected,
  }

  const accordionItems = createAccordionItems([countries, outcomes, legalProcedureTypes, applicationTypes, asylumProcedures, categories, vulnerability, groundOfPersecution, legalAndProceduralIssues, householdIndividualStatus, authorities])

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
    vulnerabilitySelected,
    groundOfPersecutionSelected,
    legalAndProceduralIssuesSelected,
    householdIndividualStatusSelected,
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
              const filterDataMap = {
                [AirtableBaseNameEnum.Vulnerability]: vulnerability,
                [AirtableBaseNameEnum.GroundOfPersecution]: groundOfPersecution,
                [AirtableBaseNameEnum.LegalAndProceduralIssues]: legalAndProceduralIssues,
                [AirtableBaseNameEnum.HouseholdIndividualStatus]: householdIndividualStatus,
              }

              const filterData = filterDataMap[accordionItem.airtableBaseName as keyof typeof filterDataMap]

              if (!filterData) return null

              // Collecter les sous-catégories et keywords pertinents pour ce filtre
              const relevantSubCategories = new Set<string>()
              const categoryIds = new Set<string>()

              filterData.value.forEach((category: AirtableRecord) => {
                categoryIds.add(category.id)
                const subCatIds = toIdArray(getFieldValue(category, 'SubCategories'))
                subCatIds.forEach(id => relevantSubCategories.add(id))
              })

              const filterSubCategories = subCategories.value ? subCategories.value.filter((sc: AirtableRecord) => relevantSubCategories.has(sc.id)) : []
              
              // Filtrer les keywords via leur champ Categories ou SubCategory
              const filterKeywords = keywords.value ? keywords.value.filter((kw: AirtableRecord) => {
                const kwCategories = toIdArray(getFieldValue(kw, 'Categories'))
                const kwSubCategories = toIdArray(getFieldValue(kw, 'SubCategory'))
                
                // Le keyword appartient à ce filtre si :
                // - son champ Categories contient l'ID de la catégorie
                // - ou son champ SubCategory contient un ID de sous-catégorie de ce filtre
                const belongsToCategory = kwCategories.some(catId => categoryIds.has(catId))
                const belongsToSubCategory = kwSubCategories.some(subId => relevantSubCategories.has(subId))
                
                return belongsToCategory || belongsToSubCategory
              }) : []
              console.log("toto", {filterKeywords,filterSubCategoriesfilterData :filterData.value})
              return (
                <AccordionItem value={`item-${accordionItemIndex}`} key={accordionItemIndex}>
                  <AccordionTrigger>{t(accordionItem.accordionTriggerLabel)}</AccordionTrigger>
                  <AccordionContent>
                    <FilterItemWrapper
                      count={count}
                      FilterItemWrapperBackButtonLabel={t(accordionItem.accordionTriggerLabel)}
                      setClosePanel={() => setOpenAccordionItems(prev => prev.filter(value => value !== itemValue))}
                      setCloseAllPanel={() => setDisplayFilterPanel(false)}
                      showFilterItemWrapper={openAccordionItems.includes(itemValue)}
                    >
                      <CategoriesFilterItem
                        categories={filterData.value as AirtableRecord[]}
                        subCategories={filterSubCategories}
                        keywords={filterKeywords}
                        airtableBaseName={accordionItem.airtableBaseName}
                        selectedIds={SELECTED_IDS_MAP[accordionItem.airtableBaseName] ?? []}
                      />
                    </FilterItemWrapper>
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

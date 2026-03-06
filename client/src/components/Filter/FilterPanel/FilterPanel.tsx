import type { AiretableBaseName } from '@/types/index'
import { useAirtableFilter } from '@/hooks'
import { FilterItem } from '@/components/Filter'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui'

export const FilterPanel = () => {
  interface AccordionInterface {
    accordionTriggerLabel: string
    airtableBaseName: AiretableBaseName
    search: {
      enabled: boolean
      placeholder: string
    }
  }

  interface AccordionItemInterface extends AccordionInterface {
    items: any[]
  }
  const { filterRecords } = useAirtableFilter()
  const ACCORDION_CONFIG: AccordionInterface[] = [
    {
      accordionTriggerLabel: 'Outcome',
      airtableBaseName: 'Outcomes',
      search: {
        enabled: false,
        placeholder: 'Search outcome',
      },
    },
    {
      accordionTriggerLabel: 'Country of origin',
      airtableBaseName: 'Countries',
      search: {
        enabled: true,
        placeholder: 'Search a Country',
      },
    },
    {
      accordionTriggerLabel: 'Competent court',
      airtableBaseName: 'LegalProcedureTypes',
      search: {
        enabled: false,
        placeholder: 'Search a Competent court',
      },
    },
    {
      accordionTriggerLabel: 'Type of legal procedure',
      airtableBaseName: 'LegalProcedureTypes',
      search: {
        enabled: false,
        placeholder: 'Search a Type of legal procedure',
      },
    },
  ]
  const accordionItems: AccordionItemInterface[] = ACCORDION_CONFIG.map((accordionConfigItem) => {
    const matchedFilter = filterRecords.find(filter => filter.label === accordionConfigItem.airtableBaseName)

    return {
      ...accordionConfigItem,
      items: matchedFilter?.value ?? [],
      available: matchedFilter?.available ?? false,
    }
  })
  return (
    <Accordion type="multiple" collapsible={true}>
      {accordionItems.map((accordionItem, accordionItemIndex) => (
        <AccordionItem value={`item-${accordionItemIndex}`}>
          <AccordionTrigger>{ accordionItem.accordionTriggerLabel }</AccordionTrigger>
          <AccordionContent>
            <FilterItem
              enabledSearch={accordionItem.search.enabled}
              searchPlaceholder={accordionItem.search.placeholder}
              items={accordionItem.items}
            />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

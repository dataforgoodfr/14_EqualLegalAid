import { AirtableBaseNameEnum, FilterTypeEnum } from '@/types'
import type { AccordionInterface } from '@/components/Filter'
import {
  type ToggleSelectedPayload,
  toggleApplicationTypesSelected,
  toggleAsylumProceduresSelected,
  toggleAuthoritiesSelected,
  toggleCountriesSelected,
  toggleLegalProcedureTypesSelected,
  toggleOutcomesSelected,
} from '@/redux/filtersSlice'
import type { ActionCreatorWithPayload } from '@reduxjs/toolkit'

export const ACCORDION_CONFIG: AccordionInterface[] = [
  {
    accordionTriggerLabel: 'Outcome',
    airtableBaseName: AirtableBaseNameEnum.Outcomes,
    filterType: FilterTypeEnum.Basic,
    search: { enabled: false, placeholder: 'Search' },
  },
  {
    accordionTriggerLabel: 'Country of origin',
    airtableBaseName: AirtableBaseNameEnum.Countries,
    filterType: FilterTypeEnum.Basic,
    search: { enabled: true, placeholder: 'Search a Country' },
  },
  {
    accordionTriggerLabel: 'Type of application',
    airtableBaseName: AirtableBaseNameEnum.ApplicationTypes,
    filterType: FilterTypeEnum.Basic,
    search: { enabled: false, placeholder: 'Search' },
  },
  {
    accordionTriggerLabel: 'Asylum procedure',
    airtableBaseName: AirtableBaseNameEnum.AsylumProcedures,
    filterType: FilterTypeEnum.Basic,
    search: { enabled: false, placeholder: 'Search' },
  },
  {
    accordionTriggerLabel: 'Type of legal procedure',
    airtableBaseName: AirtableBaseNameEnum.LegalProcedureTypes,
    filterType: FilterTypeEnum.Basic,
    search: { enabled: false, placeholder: 'Search a Type of legal procedure' },
  },
  {
    accordionTriggerLabel: 'Competent Court',
    airtableBaseName: AirtableBaseNameEnum.Authorities,
    filterType: FilterTypeEnum.NameToSplit,
    search: { enabled: false, placeholder: 'Search' },
  },
]

export const TOGGLE_ACTION_MAP: Partial<Record<AirtableBaseNameEnum, ActionCreatorWithPayload<ToggleSelectedPayload>>> = {
  [AirtableBaseNameEnum.Countries]: toggleCountriesSelected,
  [AirtableBaseNameEnum.Outcomes]: toggleOutcomesSelected,
  [AirtableBaseNameEnum.LegalProcedureTypes]: toggleLegalProcedureTypesSelected,
  [AirtableBaseNameEnum.ApplicationTypes]: toggleApplicationTypesSelected,
  [AirtableBaseNameEnum.AsylumProcedures]: toggleAsylumProceduresSelected,
  [AirtableBaseNameEnum.Authorities]: toggleAuthoritiesSelected,
}

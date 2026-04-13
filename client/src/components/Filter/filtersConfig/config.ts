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
    accordionTriggerLabel: 'filter.outcome',
    airtableBaseName: AirtableBaseNameEnum.Outcomes,
    filterType: FilterTypeEnum.Basic,
    search: { enabled: false, placeholder: 'filter.search' },
  },
  {
    accordionTriggerLabel: 'filter.countryOfOrigin',
    airtableBaseName: AirtableBaseNameEnum.Countries,
    filterType: FilterTypeEnum.Basic,
    search: { enabled: true, placeholder: 'filter.searchCountry' },
  },
  {
    accordionTriggerLabel: 'filter.typeOfApplication',
    airtableBaseName: AirtableBaseNameEnum.ApplicationTypes,
    filterType: FilterTypeEnum.Basic,
    search: { enabled: false, placeholder: 'filter.search' },
  },
  {
    accordionTriggerLabel: 'filter.asylumProcedure',
    airtableBaseName: AirtableBaseNameEnum.AsylumProcedures,
    filterType: FilterTypeEnum.Basic,
    search: { enabled: false, placeholder: 'filter.search' },
  },
  {
    accordionTriggerLabel: 'filter.typeOfLegalProcedure',
    airtableBaseName: AirtableBaseNameEnum.LegalProcedureTypes,
    filterType: FilterTypeEnum.Basic,
    search: { enabled: false, placeholder: 'filter.searchLegalProcedure' },
  },
  {
    accordionTriggerLabel: 'filter.competentCourt',
    airtableBaseName: AirtableBaseNameEnum.Authorities,
    filterType: FilterTypeEnum.NameToSplit,
    search: { enabled: false, placeholder: 'filter.search' },
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

import { AiretableBaseNameEnum, FilterTypeEnum } from "@/types";
import type { AccordionInterface } from "../FilterPanel/FilterPanel";
import { toggleCountriesSelected, toggleLegalProcedureTypesSelected, toggleOutcomesSelected, type ToggleSelectedPayload } from "@/redux/filtersSlice";
import type { ActionCreatorWithPayload } from "@reduxjs/toolkit";

export const ACCORDION_CONFIG: AccordionInterface[] = [
  {
    accordionTriggerLabel: 'Outcome',
    airtableBaseName: AiretableBaseNameEnum.Outcomes,
    filterType: FilterTypeEnum.Basic,
    search: { enabled: false, placeholder: 'Search outcome' },
  },
  {
    accordionTriggerLabel: 'Country of origin',
    airtableBaseName: AiretableBaseNameEnum.Countries,
    filterType: FilterTypeEnum.Basic,
    search: { enabled: true, placeholder: 'Search a Country' },
  },
  {
    accordionTriggerLabel: 'Competent court',
    airtableBaseName: AiretableBaseNameEnum.ApplicationTypes,
    filterType: FilterTypeEnum.Basic,
    search: { enabled: false, placeholder: 'Search' },
  },
  {     
    accordionTriggerLabel: 'Asylum procedure',
    airtableBaseName: AiretableBaseNameEnum.AsylumProcedures,
    filterType: FilterTypeEnum.Basic,
    search: { enabled: false, placeholder: 'Search' },
  },
  {
    accordionTriggerLabel: 'Type of legal procedure',
    airtableBaseName: AiretableBaseNameEnum.LegalProcedureTypes,
    filterType: FilterTypeEnum.Basic,
    search: { enabled: false, placeholder: 'Search a Type of legal procedure' },
  },
]


export const TOGGLE_ACTION_MAP: Partial<Record<AiretableBaseNameEnum, ActionCreatorWithPayload<ToggleSelectedPayload>>> = {
  [AiretableBaseNameEnum.Countries]: toggleCountriesSelected,
  [AiretableBaseNameEnum.Outcomes]: toggleOutcomesSelected,
  [AiretableBaseNameEnum.LegalProcedureTypes]: toggleLegalProcedureTypesSelected,
}
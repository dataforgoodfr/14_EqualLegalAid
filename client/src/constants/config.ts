/**
 * Application configuration constants
 */
import type { AiretableBaseName } from '../types'
export const AIRTABLE_CONFIG = {
  apiKey: import.meta.env.VITE_AIRTABLE_API_KEY,
  baseId: import.meta.env.VITE_AIRTABLE_BASE_ID,
  tableName: import.meta.env.VITE_AIRTABLE_TABLE_NAME,
} as const

interface AppConfigInterface {
  defaultBaseName: AiretableBaseName
  defaultView: AiretableBaseName
  maxRecords: number
}

export const APP_CONFIG = {
  defaultBaseName: 'Caselaws',
  defaultView: 'Caselaws',
  maxRecords: 100,
} as const satisfies AppConfigInterface

export const AIRTABLE_BASE_NAME = {
  caselaws: 'Caselaws',
  applicationTypes: 'ApplicationTypes',
  asylumProcedures: 'AsylumProcedures',
  legalProcedureTypes: 'LegalProcedureTypes',
  countries: 'Countries',
  authorities: 'Authorities',
  outcomes: 'Outcomes',
  keywords: 'Keywords',
  subCategories: 'SubCategories',
  categories: 'Categories',
} as const satisfies Record<string, AiretableBaseName>

export const AIRTABLE_FILTER_BASE_NAME = {
  applicationTypes: 'ApplicationTypes',
  asylumProcedures: 'AsylumProcedures',
  legalProcedureTypes: 'LegalProcedureTypes',
  countries: 'Countries',
  authorities: 'Authorities',
  outcomes: 'Outcomes',
  keywords: 'Keywords',
  subCategories: 'SubCategories',
  categories: 'Categories',
} as const satisfies Record<string, AiretableBaseName>

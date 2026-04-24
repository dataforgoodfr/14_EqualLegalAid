export * from './filter'

/**
 * Type definitions for the ELA application
 */

export type AirtableBaseName = 'Caselaws' | 'ApplicationTypes' | 'AsylumProcedures' | 'LegalProcedureTypes' | 'Countries' | 'Authorities' | 'Outcomes' | 'Keywords' | 'SubCategories' | 'Categories' | 'IND_1_EU_Asylumapplications' | 'Indicators_custom_texts'

export enum AirtableBaseNameEnum {
  Caselaws = 'Caselaws',
  ApplicationTypes = 'ApplicationTypes',
  AsylumProcedures = 'AsylumProcedures',
  LegalProcedureTypes = 'LegalProcedureTypes',
  Countries = 'Countries',
  Authorities = 'Authorities',
  Outcomes = 'Outcomes',
  Keywords = 'Keywords',
  SubCategories = 'SubCategories',
  Categories = 'Categories',
}

/**
 * Represents possible field value types from Airtable
 */
export type AirtableFieldValue
  = | string
    | number
    | boolean
    | null
    | undefined
    | AirtableAttachment[]
    | AirtableUser[]
    | string[]
    | number[]
    | Record<string, unknown>

/**
 * Represents a record from Airtable
 */
export interface AirtableRecord {
  id: string
  fields: Record<string, AirtableFieldValue>
}

export interface BaseFields {
  Name_EN: string
  Name_GR: string
  Caselaws?: string
  Count_Caselaws?: string
}

export interface AuthoritiesFields extends BaseFields {
  Type_EN: string
  Type_GR: string
  Name_Long_EN: string
  Name_Long_GR: string
}
export interface KeywordsFields {
  Keyword_EN: string
  Keyword_GR: string
  SubCategory: string
  Caselaws: string
}
/**
 * Represents an attachment from Airtable (e.g., PDFs)
 */
export interface AirtableAttachment {
  id: string
  url: string
  filename: string
  size: number
  type: string
}

/**
 * Represents a user object from Airtable
 */
export interface AirtableUser {
  id?: string
  name?: string
  email?: string
}

/**
 * Configuration for Airtable connection
 */
export interface AirtableConfig {
  apiKey: string
  baseId: string
  tableName: string
}

export interface PdfObjectInterface {
  pdfFileName: string
  pdfURL: string
}

/**
 * Represents a case law record with structured fields.
 * Fields suffixed with _GR hold the Greek version; they fall back to the English value if empty.
 */
export interface Caselaw {
  title: string
  publishedAt: Date
  applicationTypes: string
  applicationTypes_GR: string
  legalProcedureTypes: string
  legalProcedureTypes_GR: string
  asylumProcedure: string
  asylumProcedure_GR: string
  countryOfOrigin: string
  countryOfOrigin_GR: string
  competentCourtOrAuthority: string
  competentCourtOrAuthority_GR: string
  caselawOutcome: string
  caselawOutcome_GR: string
  keywords: string[]
  keywords_GR: string[]
  englishPdfLink: PdfObjectInterface
  greekPdfLink: PdfObjectInterface
}

export interface FetchRecordsFromTableConfig {
  tableName: AirtableBaseName
  selectConfig?: {
    maxRecords?: number
    pageSize?: number
    userLocale?: 'en-us' | 'el-GR'
    cellFormat?: 'json' | 'string'
    timeZone?: string
    view?: string
    fields?: string[]
    filterByFormula?: string
    sort?: Array<{
      field: string
      direction?: 'asc' | 'desc'
    }>
  }
}

export interface SelectedCaselawItem {
  id: string
  pdf: PdfObjectInterface
}

export type HeaderNavigationItemType = 'caselaw' | 'statistics'

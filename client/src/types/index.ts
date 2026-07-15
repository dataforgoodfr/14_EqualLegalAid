export * from './filter'

/**
 * Type definitions for the ELA application
 */

export type AirtableBaseName = 'Caselaws' | 'ApplicationTypes' | 'AsylumProcedures' | 'LegalProcedureTypes' | 'Countries' | 'Authorities' | 'Outcomes' | 'Keywords' | 'SubCategories' | 'Categories' | 'Vulnerability' | 'GroundOfPersecution' | 'LegalAndProceduralIssues' | 'HouseholdIndividualStatus' | 'IND_1_EU_Asylumapplications' | 'ind5_1_6_applications_per_country_and_location' | 'ind5_2_3_applications_per_gender_and_age' | 'Indicators_custom_texts' | 'v2_ind3_arrivals_greece' | 'ind5_total_applications_in_greece' | 'ind4_asylum_seekers_in_greece' | 'ind4_asylum_camp_locations' | 'ind5_4_5_applications_per_first_and_subsequent' | 'ind6_first_instance_decisions' | 'ind9_second_instance_decisions' | 'ind10_recognition_rates' | 'ind11_ind13_annulments' | 'ind12_interim_measures' | 'ind14_legal_aid_applications'

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
  Vulnerability = 'Vulnerability',
  GroundOfPersecution = 'GroundOfPersecution',
  LegalAndProceduralIssues = 'LegalAndProceduralIssues',
  HouseholdIndividualStatus = 'HouseholdIndividualStatus',
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
  id: string
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
  pdfEN: PdfObjectInterface
  pdfGR: PdfObjectInterface
}

export type HeaderNavigationItemType = 'caselaw' | 'statistics'

export type StatisticCustomTextName = 'AsylumApplicationsInEurope' | 'AsylumApplicationsInEuropeanUnion' | 'ArrivalsInGreece' | 'AsylumApplicationsEvolutionInGreece' | 'ApplicationsEvolutionGreece' | 'ProtectionGrantedVsRejected' | 'AsylumSeekersCamps' | 'CourtAsylumProcedures' | 'Methodology'
export type StatisticOutletContext = {
  customTexts: any[]
  getCustomText: (name: StatisticCustomTextName) => any | null
}

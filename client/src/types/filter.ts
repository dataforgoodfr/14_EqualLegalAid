import type { AirtableBaseNameEnum } from './index'

export const DATE_FILTER_STATE_NAME = 'Date' as const

export type FilterStateName = AirtableBaseNameEnum | typeof DATE_FILTER_STATE_NAME

export interface DatePartSelection {
  month: number | null
  year: number | null
}

export interface BasicValuesInterface {
  id: string
  fields: {
    Name_EN: string
    Name_GR: string
    Count_Caselaws: number
    Caselaws: string[]
    Name_Long_EN?: string
    Name_Long_GR?: string
  }
}

export interface FilterInterface {
  label: AirtableBaseNameEnum
  value: BasicValuesInterface[]
  available: boolean
}
export interface FilterTagInterface {
  name: string
  id: string
  filterStateName: FilterStateName
}
export interface searchInGivenFilterInterface {
  value: string
  airtableBaseName: AirtableBaseNameEnum
  needFetch: boolean
}

export enum FilterTypeEnum {
  Basic = 'Basic',
  NameToSplit = 'NameToSplit',
  Other = 'Other',
}

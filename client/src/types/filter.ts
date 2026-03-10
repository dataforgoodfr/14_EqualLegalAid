import type { AirtableBaseNameEnum } from './index'

export  interface BasicValuesInterface {
    id: string
    fields: {
      Name_EN: string
      Name_GR: string
      Count_Caselaws: number
      Caselaws: string[]
    }
  }

export interface FilterInterface {
  label: AirtableBaseNameEnum
  value: BasicValuesInterface[]
  available: boolean
}


export enum FilterTypeEnum {
  Basic = 'Basic',
  Other = 'Other',
}
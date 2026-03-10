import type { AiretableBaseNameEnum } from './index'

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
  label: AiretableBaseNameEnum
  value: BasicValuesInterface[]
  available: boolean
}


export enum FilterTypeEnum {
  Basic = 'Basic',
  Other = 'Other',
}
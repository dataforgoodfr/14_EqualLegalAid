import type { AirtableRecord, AirtableBaseNameEnum } from '@/types'

export interface CategoriesFilterItemProps {
  categories: AirtableRecord[]
  subCategories: AirtableRecord[]
  keywords: AirtableRecord[]
  airtableBaseName: AirtableBaseNameEnum
  selectedIds: string[]
}

export interface SubCategoryItem {
  id: string
  name: string
  keywords: AirtableRecord[]
}

export interface CategoryWithChildren {
  id: string
  name: string
  keywords: AirtableRecord[]
  subCategories: SubCategoryItem[]
}

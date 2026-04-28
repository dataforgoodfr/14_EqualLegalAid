import { useMemo } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Checkbox,
  Field,
  FieldGroup,
  Label,
} from '@/components/ui'
import { useTranslation } from 'react-i18next'
import { useAppDispatch } from '@/hooks/reduxHook'
import { setFilterTag } from '@/redux/filtersSlice'
import { AirtableBaseNameEnum } from '@/types'
import type { AirtableRecord } from '@/types'

type FilterItem = {
  id: string
  name: string
  type: 'subCategory' | 'keyword'
  subCategory?: {
    id: string
    name: string
    keywords: AirtableRecord[]
  }
}

interface HierarchicalFilterItemProps {
  categories: AirtableRecord[]
  subCategories: AirtableRecord[]
  keywords: AirtableRecord[]
  airtableBaseName: AirtableBaseNameEnum
  selectedIds: string[]
  onFilterChange?: (id: string, checked: boolean) => void
}

const toIdArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }

  if (typeof value === 'string') {
    return value.split(',').map(item => item.trim()).filter(Boolean)
  }

  return []
}

const getFieldValue = (record: AirtableRecord, key: string): unknown => {
  const fieldKey = Object.keys(record.fields).find(fieldName => fieldName.toLowerCase() === key.toLowerCase())
  return fieldKey ? record.fields[fieldKey] : undefined
}

const getStringField = (record: AirtableRecord, key: string): string => {
  const value = getFieldValue(record, key)
  return typeof value === 'string' ? value : ''
}

const getCategoryName = (record: AirtableRecord, isGreek: boolean): string => {
  return isGreek
    ? getStringField(record, 'Name_GR') || getStringField(record, 'Name_EN')
    : getStringField(record, 'Name_EN')
}

const getSubCategoryName = (record: AirtableRecord, isGreek: boolean): string => {
  return isGreek
    ? getStringField(record, 'Name_GR') || getStringField(record, 'Name_EN')
    : getStringField(record, 'Name_EN')
}

const getKeywordName = (record: AirtableRecord, isGreek: boolean): string => {
  return isGreek
    ? getStringField(record, 'Keyword_GR') || getStringField(record, 'Keyword_EN')
    : getStringField(record, 'Keyword_EN')
}

export const HierarchicalFilterItem = ({
  categories,
  subCategories,
  keywords,
  airtableBaseName,
  selectedIds,
  onFilterChange,
}: HierarchicalFilterItemProps) => {
  const { i18n } = useTranslation()
  const isGreek = i18n.language === 'el'
  const dispatch = useAppDispatch()

  const subCategoryMap = useMemo(
    () => new Map((subCategories || []).map(sc => [sc.id, sc])),
    [subCategories],
  )

  const keywordMap = useMemo(
    () => new Map((keywords || []).map(kw => [kw.id, kw])),
    [keywords],
  )

  const categoriesWithChildren = useMemo(() => categories.map((category) => {
    const categoryKeywords = toIdArray(getFieldValue(category, 'Keywords'))
      .map(id => keywordMap.get(id))
      .filter((kw): kw is AirtableRecord => Boolean(kw))

    const subCategoryIds = toIdArray(getFieldValue(category, 'SubCategories'))
    const subCategoryItems = subCategoryIds
      .map(id => subCategoryMap.get(id))
      .filter((sc): sc is AirtableRecord => Boolean(sc))
      .map(subCategory => ({
        id: subCategory.id,
        name: getSubCategoryName(subCategory, isGreek),
        keywords: toIdArray(getFieldValue(subCategory, 'Keywords'))
          .map(id => keywordMap.get(id))
          .filter((kw): kw is AirtableRecord => Boolean(kw)),
      }))

    return {
      id: category.id,
      name: getCategoryName(category, isGreek),
      keywords: categoryKeywords,
      subCategories: subCategoryItems,
    }
  }), [categories, subCategoryMap, keywordMap, isGreek])

  const itemsToDisplay = useMemo(() => {
    const isSpecialFilter = airtableBaseName === AirtableBaseNameEnum.GroundOfPersecution || airtableBaseName === AirtableBaseNameEnum.HouseholdIndividualStatus
    const items: FilterItem[] = []

    categoriesWithChildren.forEach(category => {
      if (isSpecialFilter && category.subCategories.length === 1) {
        // Pour les filtres spéciaux, si une seule sous-catégorie, afficher directement ses keywords
        category.subCategories[0].keywords.forEach(keyword => {
          items.push({
            id: keyword.id,
            name: getKeywordName(keyword, isGreek),
            type: 'keyword',
            subCategory: category.subCategories[0],
          })
        })
      } else {
        // Sinon, afficher les sous-catégories
        category.subCategories.forEach(sub => {
          items.push({
            id: sub.id,
            name: sub.name,
            type: 'subCategory',
            subCategory: sub,
          })
        })
      }
    })
    return items
  }, [categoriesWithChildren, airtableBaseName, isGreek])

  const handleCheckboxChange = (itemId: string, checked: boolean) => {
    if (onFilterChange) {
      onFilterChange(itemId, checked)
    }

    const item = itemsToDisplay.find(i => i.id === itemId)
    const name = item ? item.name : itemId

    dispatch(setFilterTag({
      itemChecked: checked,
      item: {
        name,
        id: itemId,
        filterStateName: airtableBaseName,
      },
    }))
  }

  return (
    <Accordion type="multiple" className="w-full">
      {itemsToDisplay.map((item) => {
        const isSelected = selectedIds.includes(item.id)
        return (
          <AccordionItem value={item.id} key={item.id}>
            <AccordionTrigger className="hover:no-underline py-2">
              <div className="flex items-center gap-2 flex-1">
                <Checkbox
                  id={item.id}
                  checked={isSelected}
                  onCheckedChange={(checked) => {
                    handleCheckboxChange(item.id, checked as boolean)
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                />
                <span className="font-normal cursor-pointer flex-1">
                  {item.name}
                </span>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              {item.type === 'subCategory' && item.subCategory && item.subCategory.keywords.length > 0 && (
                <div className="ml-4">
                  <h4 className="font-semibold text-sm mb-2">Keywords</h4>
                  <FieldGroup>
                    {item.subCategory.keywords.map((keyword) => (
                      <Field key={keyword.id}>
                        <Checkbox
                          id={keyword.id}
                          checked={selectedIds.includes(keyword.id)}
                          onCheckedChange={(checked) => {
                            handleCheckboxChange(keyword.id, checked as boolean)
                          }}
                        />
                        <Label htmlFor={keyword.id} className="font-normal cursor-pointer ml-2">
                          {getKeywordName(keyword, isGreek)}
                        </Label>
                      </Field>
                    ))}
                  </FieldGroup>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
